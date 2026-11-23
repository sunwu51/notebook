'use client'
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import PostView from '@/app/components/PostView';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

const DRAFT_KEY = 'nb:draft:v1';
const extensions = [markdown(), EditorView.lineWrapping];

const pad = (n) => String(n).padStart(2, '0');
function currentMonth() {
  const d = new Date();
  return `${String(d.getFullYear()).slice(2)}.${pad(d.getMonth() + 1)}`;
}
function newTemplate() {
  const d = new Date();
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${pad(Math.floor(Math.abs(tz) / 60))}:${pad(Math.abs(tz) % 60)}`;
  // date 必须带上：首页排序依赖它，否则会退化为文件创建时间
  return `---\ntitle: \ndate: ${date}\ntags:\n  - \n---\n\n`;
}
function titleOf(content) {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const m = fm && fm[1].match(/^title:\s*(.+?)\s*$/m);
  return m ? m[1].replace(/^["']|["']$/g, '') : '';
}
const toFilename = (title) => (title.replace(/[\\/:*?"<>|#%\s]+/g, '_').replace(/^[._]+|_+$/g, '') || 'untitled') + '.md';

export default function WritePage() {
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState('');
  const [filename, setFilename] = useState('untitled.md');
  const [filenameTouched, setFilenameTouched] = useState(false);
  const [content, setContent] = useState('');
  const [restored, setRestored] = useState(null); // 恢复草稿的提示
  const [saveState, setSaveState] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);
  const [me, setMe] = useState('');
  const [viewMode, setViewMode] = useState('split'); // split | edit | preview
  const latest = useRef({});
  latest.current = { month, filename, filenameTouched, content };

  // 初始化：优先恢复 localStorage 草稿
  useEffect(() => {
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch {}
    if (draft && (titleOf(draft.content || '') || (draft.content || '').replace(/^---[\s\S]*?---/, '').trim())) {
      setMonth(draft.month || currentMonth());
      setFilename(draft.filename || 'untitled.md');
      setFilenameTouched(!!draft.filenameTouched);
      setContent(draft.content);
      setRestored(new Date(draft.updatedAt).toLocaleString());
    } else {
      setMonth(currentMonth());
      setContent(newTemplate());
    }
    try {
      const vm = localStorage.getItem('nb:viewMode');
      if (['split', 'edit', 'preview'].includes(vm)) setViewMode(vm);
    } catch {}
    setReady(true);
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setMe(d.login || '')).catch(() => {});
  }, []);

  // 没手动改过文件名时，跟随 front matter 里的 title
  useEffect(() => {
    if (!ready || filenameTouched) return;
    const t = titleOf(content);
    if (t) setFilename(toFilename(t));
  }, [content, ready, filenameTouched]);

  // 自动保存草稿到 localStorage（防抖 + 关闭页面前强制保存）
  const saveDraft = () => {
    const { month, filename, filenameTouched, content } = latest.current;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ month, filename, filenameTouched, content, updatedAt: Date.now() }));
      setSaveState('草稿已保存 ' + new Date().toLocaleTimeString());
    } catch {
      setSaveState('草稿保存失败（存储已满？）');
    }
  };
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [content, month, filename, filenameTouched, ready]);
  useEffect(() => {
    window.addEventListener('beforeunload', saveDraft);
    return () => window.removeEventListener('beforeunload', saveDraft);
  }, []);

  // 服务端预览：与文章页使用同一套编译流程
  useEffect(() => {
    if (!ready || !month) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setCompiling(true);
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: content, month }),
          signal: ctrl.signal,
        });
        if (res.status === 401) { setError('登录已过期，请刷新页面重新登录（草稿已保存在本地）'); return; }
        const data = await res.json();
        if (data.error) setError(data.error);
        else { setError(''); setPreview(data); }
      } catch (e) {
        if (e.name !== 'AbortError') setError('预览请求失败：' + e.message);
      } finally {
        if (!ctrl.signal.aborted) setCompiling(false);
      }
    }, 700);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [content, month, ready]);

  const previewEl = useMemo(() => preview && (
    <PostView
      code={preview.code}
      frontmatter={preview.frontmatter}
      readingTimeText={preview.readingTimeText}
      tags={preview.tags}
      fallbackTitle={filename.replace(/\.mdx?$/, '')}
    />
  ), [preview]); // eslint-disable-line react-hooks/exhaustive-deps

  const publish = async () => {
    if (!confirm(`发布到 ${month}/${filename} ？\n会直接提交到 GitHub 并触发 Vercel 部署。`)) return;
    setPublishing(true); setResult(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, filename, content }),
      });
      const data = await res.json();
      setResult(data);
      if (data.ok) { try { localStorage.removeItem(DRAFT_KEY); } catch {} setSaveState('已发布，本地草稿已清除'); }
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setPublishing(false);
    }
  };

  const changeView = (m) => {
    setViewMode(m);
    try { localStorage.setItem('nb:viewMode', m); } catch {}
  };

  const reset = () => {
    if (!confirm('放弃当前草稿并新建？')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setMonth(currentMonth()); setFilename('untitled.md'); setFilenameTouched(false);
    setContent(newTemplate()); setRestored(null); setResult(null); setPreview(null);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.href = '/';
  };

  const inputCls = 'border border-gray-300 rounded px-2 py-1 text-sm bg-white text-black';
  const btnCls = 'px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col" style={{ fontSize: 14 }}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <a href="/" className={btnCls}>← 首页</a>
        <span className="text-sm text-gray-500">目录</span>
        <input className={inputCls + ' w-20'} value={month} onChange={(e) => setMonth(e.target.value.trim())} placeholder="26.11" />
        <span className="text-sm text-gray-500">文件名</span>
        <input className={inputCls + ' w-64'} value={filename}
          onChange={(e) => { setFilename(e.target.value.trim()); setFilenameTouched(true); }} />
        <span className="text-xs text-gray-500 ml-2">{compiling ? '预览编译中…' : saveState}</span>
        <div className="flex-1" />
        {me && <span className="text-xs text-gray-500">@{me}</span>}
        <div className="inline-flex rounded border border-gray-300 overflow-hidden">
          {[['edit', '仅源码'], ['split', '对照'], ['preview', '仅预览']].map(([m, label]) => (
            <button key={m} onClick={() => changeView(m)}
              className={'px-3 py-1 text-sm ' + (viewMode === m ? 'bg-gray-800 text-white' : 'bg-white text-black hover:bg-gray-100')}>
              {label}
            </button>
          ))}
        </div>
        <button className={btnCls} onClick={reset}>新建</button>
        <button className={btnCls} onClick={logout}>退出</button>
        <button
          className="px-4 py-1 rounded text-sm bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
          disabled={publishing || !!error || !content.trim() || !/^\d\d\.\d\d?$/.test(month) || !/^[^/\\]+\.mdx?$/.test(filename)}
          onClick={publish}
          title={error ? 'MDX 有错误，修复后才能发布' : ''}
        >{publishing ? '发布中…' : '发布'}</button>
      </div>

      {restored && (
        <div className="px-3 py-1 text-sm bg-yellow-100 text-yellow-900 flex gap-3">
          已恢复本地草稿（保存于 {restored}）
          <button className="underline" onClick={() => setRestored(null)}>知道了</button>
        </div>
      )}
      {result && (
        <div className={'px-3 py-1 text-sm whitespace-pre-wrap ' + (result.ok ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900')}>
          {result.ok
            ? <>已提交 {result.path}，Vercel 部署中。<a className="underline" href={result.commitUrl} target="_blank" rel="noreferrer">查看 commit</a></>
            : '发布失败：' + result.error}
          <button className="underline ml-3" onClick={() => setResult(null)}>关闭</button>
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        <div className={'h-full overflow-auto border-gray-200 ' + (viewMode === 'split' ? 'w-1/2 border-r' : viewMode === 'edit' ? 'w-full' : 'hidden')}>
          {ready && (
            <CodeMirror value={content} extensions={extensions} onChange={setContent}
              height="100%" style={{ height: '100%' }}
              basicSetup={{ foldGutter: false }} />
          )}
        </div>
        <div className={'h-full overflow-auto relative ' + (viewMode === 'split' ? 'w-1/2' : viewMode === 'preview' ? 'w-full' : 'hidden')}>
          {error && (
            <pre className="sticky top-0 z-10 m-0 p-2 text-xs bg-red-100 text-red-900 whitespace-pre-wrap max-h-48 overflow-auto">{error}</pre>
          )}
          <div className="markdown-body p-6">{previewEl}</div>
        </div>
      </div>
    </div>
  );
}

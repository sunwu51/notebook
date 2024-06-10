'use client'
import Giscus from '@giscus/react';

const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
export default function () {
    return <Giscus
        id="comments"
        repo="sunwu51/notebook"
        repoId="MDEwOlJlcG9zaXRvcnkxMTkxNjk2MzE="
        category="General"
        categoryId={categoryId}
        mapping="url"
        term=""
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="zh-CN"
        loading="lazy"
    />
}

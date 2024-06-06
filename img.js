var fs = require('fs')
const path = require('path');
const POSTS_PATH = process.cwd();

// 根目录下所有月份命名的文件夹
var monthes = fs.readdirSync(POSTS_PATH).filter(item => item.match(/\d\d\.\d\d?/));

monthes.forEach((month) => {
    const imgdirs = fs.readdirSync(path.join(POSTS_PATH, month)).filter(item => item == 'img');
    if (imgdirs.length) {
        var imgdir = imgdirs[0];
        const imgfiles = fs.readdirSync(path.join(POSTS_PATH, month, imgdir));
        imgfiles.forEach((imgfile) => {
            const imgpath = path.join(month, imgdir, imgfile)
            const img = fs.readFileSync(path.join(POSTS_PATH, imgpath));
            if (!fs.existsSync(path.join(POSTS_PATH, 'public', 'oriimg', month))) {
                fs.mkdirSync(path.join(POSTS_PATH, 'public', 'oriimg', month))
            }
            fs.writeFileSync(path.join(POSTS_PATH, 'public', 'oriimg', month, imgfile), img)
        })
    }
})

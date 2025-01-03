const http = require('http');
const https = require('https');
const port = process.env.PORT || 8848; // 使用环境变量中的端口或默认值
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const mainPage = fs.readFileSync(path.join(publicDir, 'index.html')).toString()

const data = {}

const getData = (userID) => {
    https.get('https://api.bilibili.com/x/web-interface/card?mid=' + userID, res => {
        res.on('data', d => {
            try {
                const tempData = JSON.parse(d.toString())
                data.follower = tempData.data.follower
                data.face = tempData.data.card.face.replace(/^http:/, 'https:')
            } catch (error) {
                console.log(new Date(), '数据似乎有点问题，没事儿，一会儿再试一下')
            }
        });
    })
}

const server = http.createServer((req, res) => {
    if (/\/data\.js/.test(req.url)) {
        if (/(\?|&)u=\d+/.test(req.url)) {
            const userID = +req.url.replace(/^.*(\?|&)u=(\d+).*$/, '$2')
            if (isNaN(userID)) {
                console.log('用户 ID 好像很奇怪呢 ' + userID)
                return
            }
            getData(userID)
            setTimeout(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/javascript');
                res.write('data = ' + JSON.stringify(data) + ';showFansCount()');
                res.end();
            }, 2000);
            return
        }
        console.log('似乎用户 ID 未正确设置')
        return
    }
    if (/\/bilibili\.png$/.test(req.url)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/png');
        res.write(fs.readFileSync(path.join(publicDir, 'bilibili.png')));
        res.end();
        return
    }
    if (/\/clock-number\.ttf$/.test(req.url)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.write(fs.readFileSync(path.join(publicDir, 'clock-number.ttf')));
        res.end();
        return
    }
    if (/\/styles\.css$/.test(req.url)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        res.write(fs.readFileSync(path.join(publicDir, 'styles.css')));
        res.end();
        return
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(mainPage);
    res.end();
})

function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
server.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在 http://${getIPAddress()}:${port}/`);
});
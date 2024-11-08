const puppeteer = require('puppeteer'); // 使用完整 puppeteer 版
const { app } = require('electron');


const browsers = {};

// 配置窗口大小
// const windowWidth = 1200;
// const windowHeight = 900;
const windowWidth = 510;// 每个浏览器的宽度
const windowHeight = 660;// 每个浏览器的高度

const getChromiumPath = () => {
    // 使用 Puppeteer 的缓存路径获取 Chrome 路径
    // const chromiumPath = puppeteer.executablePath();
    // if (chromiumPath && chromiumPath !== 'undefined') {
    //     return chromiumPath;
    // }

    // 若未找到路径则提供备用路径
    return process.platform === 'win32'
        ? "C:\\Users\\NALINV\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe"
        // ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; 
};

const startBrowser = async (phoneNumber) => {

    // console.log(getChromiumPath(),'getChromiumPath()');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: getChromiumPath(),
        args: [`--window-size=${windowWidth},${windowHeight}`]
    });

    const page = await browser.newPage();
    console.log('新建tab成功');
    await page.goto('https://creator.douyin.com/', { waitUntil: 'networkidle2' });
    
    console.log('进入到登录页面');
    await page.evaluate(() => {
        console.log("开始滚动页面...");
        window.scrollTo({ left: document.body.scrollWidth, behavior: 'smooth' });

        setTimeout(() => {
            console.log("开始纵向滚动页面...");
            window.scrollBy({ top: 40, behavior: 'smooth' });
        }, 1000);
    });


    await waitForQRCode(page);

    browsers[phoneNumber] = { browser, page };
    return { page, browser };
};

const closeBlankPages = async (browser) => {
    const pages = await browser.pages();
    for (let page of pages) {
        if (page.url() === 'about:blank') {
            await page.close();
            console.log('已关闭 about:blank 页面');
        }
    }
};
// 扫码登录
const waitForQRCode = async (page) => {
    await page.waitForSelector('div.qrcode-image-QrGzx7');

    let loginSuccess = false;

    // 定时检测是否登录成功
    const loginCheckInterval = setInterval(async () => {
        const currentUrl = page.url();
        if (currentUrl !== 'https://creator.douyin.com/') {
            console.log("登录成功！");
            loginSuccess = true;
            clearInterval(loginCheckInterval);
        } else {
            console.log("等待用户扫码...");
        }
    }, 3000);

    return new Promise(resolve => {
        const checkLogin = setInterval(() => {
            if (loginSuccess) {
                clearInterval(checkLogin);
                resolve();
            }
        }, 1000);
    });
};
module.exports = { startBrowser, browsers, closeBlankPages };
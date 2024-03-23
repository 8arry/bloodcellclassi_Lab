const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { classifyImage, loadModel } = require('./model.js'); // 替换为您的模型处理模块

const app = express();
const PORT = 3000;

// 使用cors中间件，允许来自任何来源的跨域请求
app.use(cors());

// 设置用于接收文件上传的中间件
const upload = multer();

// 解析请求体中的JSON数据
//app.use(bodyParser.json());

// 处理文件上传的端点
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        // 检查是否成功接收到文件
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 获取上传的图片数据
        const imageBuffer = req.file.buffer;

        // 调用模型进行分类
        const classificationResult = await classifyImage(imageBuffer);

        // 返回分类结果
        res.json(classificationResult);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

// 处理获取WordPress数据的端点
app.get('/wordpress-data', (req, res) => {
    try {
        // 这里可以编写获取WordPress数据的逻辑，例如从数据库或外部API获取数据
        // 这里暂时返回示例数据
        const wordpressData = [
            { id: 1, title: 'Post 1' },
            { id: 2, title: 'Post 2' },
            { id: 3, title: 'Post 3' }
        ];

        // 返回WordPress数据
        res.json(wordpressData);
    } catch (error) {
        console.error('Error fetching WordPress data:', error);
        res.status(500).json({ error: 'Error fetching WordPress data' });
    }
});

loadModel().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to load ONNX model:', err);
    process.exit(1);  // 如果模型无法加载，退出程序
});

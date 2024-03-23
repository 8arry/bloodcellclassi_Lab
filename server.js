const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { spawn } = require('child_process');
const encyclopediaData = require('./encyclopediaData');

const app = express();
const PORT = 3000;

// 使用cors中间件，允许来自任何来源的跨域请求
app.use(cors());

// 设置用于接收文件上传的中间件
const upload = multer();

// 解析请求体中的JSON数据
app.use(bodyParser.json());

// 处理文件上传的端点
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        // 检查是否成功接收到文件
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 获取上传的图片数据
        const imageBuffer = req.file.buffer;

        // 调用 Python 脚本进行图片分类
        const pythonProcess = spawn('python', ['E:\\毕业论文\\BCResNet\\jiaoben.py', imageBuffer.toString('base64')]);

        let classificationResult = '';

        pythonProcess.stdout.on('data', (data) => {
            classificationResult += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            // 返回分类结果
            res.json({ result: classificationResult });
        });
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

app.get('/encyclopedia', (req, res) => {
    const { classification } = req.query;
    const info = encyclopediaData[classification] || { description: '暂无信息', link: '' };
    res.json(info);
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

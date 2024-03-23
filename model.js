const ort = require('onnxruntime-node');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const mean = [0.485, 0.456, 0.406];
const std = [0.229, 0.224, 0.225];

// 假设分类名称列表为 ['Class1', 'Class2', 'Class3', 'Class4', 'Class5']
const classNames = ['嗜碱细胞', '粒性曙红白细胞', '淋巴细胞', '单核细胞', '中性白细胞'];


const modelPath = 'E:\\毕业论文\\BCResNet\\BCResNet.onnx';

// 检查模型文件是否存在
if (!fs.existsSync(modelPath)) {
    console.error(`Could not find the model at ${modelPath}. Please check the path and try again.`);
    process.exit(1);
}

// 加载模型
let session;
async function loadModel() {
    try {
        session = await ort.InferenceSession.create(modelPath);
        console.log(`Model loaded from ${modelPath}`);
        console.log(session);

        // 打印模型的输入和输出节点信息
        console.log('Model input metadata:', session.InputMetadata);
        console.log('Model output metadata:', session.OutputMetadata);
    } catch (error) {
        console.error('Error loading the model:', error);
        process.exit(1); // 加载模型发生错误时退出程序
    }
}

// 图像预处理函数
async function preprocessImage(imageBuffer) {
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(224, 224);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, 224, 224);
    const imageData = ctx.getImageData(0, 0, 224, 224).data;

    const inputTensor = new Float32Array(3 * 224 * 224);
    for (let i = 0; i < imageData.length / 4; i++) {
        inputTensor[i * 3 + 0] = ((imageData[i * 4 + 0] / 255) - mean[0]) / std[0];  // R
        inputTensor[i * 3 + 1] = ((imageData[i * 4 + 1] / 255) - mean[1]) / std[1];  // G
        inputTensor[i * 3 + 2] = ((imageData[i * 4 + 2] / 255) - mean[2]) / std[2];  // B
    }
    // 打印处理后图像张量的一部分到控制台
    console.log("Node.js environment - Tensor snippet:");
    for (let i = 0; i < 5; i++) {
        console.log(`Row ${i}:`,
            inputTensor.slice(i * 224 * 3, i * 224 * 3 + 15)); // 打印每行的前5个像素点R、G、B值
    }


    return inputTensor;
}

// 图像分类函数
async function classifyImage(imageBuffer) {
    try {
        const preprocessedInput = await preprocessImage(imageBuffer);
        const inputTensor = new ort.Tensor('float32', preprocessedInput, [1, 3, 224, 224]);
        const outputs = await session.run({ 'input.1': inputTensor });
        const outputTensor = outputs['495'];
        console.log(outputs);
        console.log(session.outputNames); // 会打印出模型的所有输入层名称
        const probabilities = outputTensor.data;

        // 获取最大值的索引
        const maxIndex = probabilities.indexOf(Math.max(...probabilities));

        // 根据索引获取分类名称
        const className = classNames[maxIndex];
        // 进一步处理outputTensor以获得可用的分类结果...

        return className;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

module.exports = {
    classifyImage,
    loadModel
};
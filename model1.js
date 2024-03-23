const { torchscript } = require('torchscript-node');
const { createCanvas, loadImage } = require('canvas');

const mean = [0.485, 0.456, 0.406];
const std = [0.229, 0.224, 0.225];

// 假设分类名称列表为 ['Class1', 'Class2', 'Class3', 'Class4', 'Class5']
const classNames = ['嗜碱细胞', '粒性曙红白细胞', '淋巴细胞', '单核细胞', '中性白细胞'];

// 加载 TorchScript 模型
let model;
async function loadModel() {
    model = torchscript.load('model.pt');
}

// 图像预处理函数
async function preprocessImage(imageBuffer) {
    try {
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
        return inputTensor;
    } catch (error) {
        console.error('Error preprocessing image:', error);
        throw error;
    }
}

// 图像分类函数
async function classifyImage(imageBuffer) {
    try {
        const preprocessedInput = await preprocessImage(imageBuffer);
        const output = model.forward(preprocessedInput);
        console.log(output); // 输出模型的推理结果
        // 进一步处理推理结果，获取分类名称
        // const maxIndex = output.argmax();  // 获取最大值索引
        // const className = classNames[maxIndex];  // 根据索引获取分类名称
        // return className;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

module.exports = {
    classifyImage,
    loadModel
};

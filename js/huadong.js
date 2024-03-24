// 获取元素
var draggableImage = document.getElementById("draggable-image");
var container = document.getElementById("draggable-container");

// 初始位置
var initialX = 0;
var initialY = 0;
var currentX = 0;
var currentY = 0;
var isDragging = false;

// 鼠标按下事件
draggableImage.addEventListener("mousedown", mouseDownHandler, false);

function mouseDownHandler(e) {
    e.preventDefault();

    // 记录初始位置
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;

    // 设置图片为正在拖拽状态
    isDragging = true;

    // 鼠标移动事件
    document.addEventListener("mousemove", mouseMoveHandler, false);

    // 鼠标释放事件
    document.addEventListener("mouseup", mouseUpHandler, false);
}

function mouseMoveHandler(e) {
    if (isDragging) {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        // 设置图片位置
        draggableImage.style.left = currentX + "px";
        draggableImage.style.top = currentY + "px";
    }
}

function mouseUpHandler() {
    // 清除定时器
    clearTimeout(dragTimer);

    // 移除事件监听
    document.removeEventListener("mousemove", mouseMoveHandler, false);
    document.removeEventListener("mouseup", mouseUpHandler, false);

    // 设置图片为非拖拽状态
    isDragging = false;
}

export function triangle(ctx, x, y, heading, size, color) {
    var c = .433;
    var dx = (size/2);
    var dy = (size * c);
    ctx.translate(x, y); //translate to center of shape
    ctx.rotate(heading); //rotate 
    ctx.translate(-x, -y); //translate center back to 0,0
    ctx.beginPath();
    ctx.moveTo(x, y - dy * 2);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x - dx, y + dy);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.restore();
}

export function circle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
}

export function rectangle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
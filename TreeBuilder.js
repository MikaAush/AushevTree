class TreeBuilder
{
    constructor(ctx, familyTree, canvasScale, boxHeight, boxLength, yGapBtwnBrothers, extraYGapBtwnCousins, xGapBtwnFrames, defaultColor, highlightColor, linesColor, highlightLinesColor, textColor, highlightTextColor, strokesColor, highlightStrokesColor, bgColor, bgLinesColor, crossesColor) {
        this.ctx = ctx;
        this.familyTree = familyTree;
        this.canvasScale = canvasScale;
        this.boxHeight = boxHeight;
        this.boxLength = boxLength;
        this.yGapBtwnBrothers = yGapBtwnBrothers;
        this.extraYGapBtwnCousins = extraYGapBtwnCousins;
        this.xGapBtwnFrames = xGapBtwnFrames;
        this.defaultColor = defaultColor;
        this.highlightColor = highlightColor;
        this.linesColor = linesColor;
        this.highlightLinesColor = highlightLinesColor;
        this.textColor = textColor;
        this.highlightTextColor = highlightTextColor;
        this.strokesColor = strokesColor;
        this.highlightStrokesColor = highlightStrokesColor;
        this.bgColor = bgColor;
        this.bgLinesColor = bgLinesColor;
        this.crossesColor = crossesColor;
        this.levelX = new Array(100).fill(0);
        this.levelY = new Array(100).fill(0);
        this.levelYMax = [0];
        this.treeBounds = [];
        this.ancestor = null;
    }

    drawBackground(canvasWidth, canvasHeight) {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.strokeStyle = this.bgLinesColor;
        this.ctx.beginPath();
        for (let i = 1; i < canvasHeight/(this.boxHeight/2); i++) {
            this.ctx.moveTo(0, this.boxHeight/2*i);
            this.ctx.lineTo(canvasWidth, this.boxHeight/2*i);
        }
        for (let i = 1; i < canvasWidth/(this.boxLength/2); i++) {
            this.ctx.moveTo(this.boxLength/2*i, 0);
            this.ctx.lineTo(this.boxLength/2*i, canvasHeight);
        }
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawCrosses(indis, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        let crossOffset = 6;
        indis.forEach(indi => {
            if (indi.children.length == 1 && indi.father) {
                this.ctx.moveTo((indi.x + this.boxLength - this.boxHeight + crossOffset) * this.canvasScale, (indi.y + crossOffset) * this.canvasScale);
                this.ctx.lineTo((indi.x + this.boxLength - crossOffset) * this.canvasScale, (indi.y + this.boxHeight - crossOffset) * this.canvasScale);
                this.ctx.moveTo((indi.x + this.boxLength - this.boxHeight + crossOffset) * this.canvasScale, (indi.y + this.boxHeight - crossOffset) * this.canvasScale);
                this.ctx.lineTo((indi.x + this.boxLength - crossOffset) * this.canvasScale, (indi.y + crossOffset) * this.canvasScale);
            }
        });
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawLines(indis, color, lineWidth) {
        this.ctx.beginPath();
        indis.forEach(indi => {
            if (indi.children.length != 0) {
                this.ctx.moveTo(Math.round((indi.x + this.boxLength) * this.canvasScale), Math.round((indi.y + this.boxHeight/2) * this.canvasScale));
                this.ctx.lineTo(Math.round(indi.x + this.boxLength + this.xGapBtwnFrames/2) * this.canvasScale, Math.round((indi.y + this.boxHeight/2) * this.canvasScale));
                indi.children.forEach(child => {
                    this.ctx.moveTo(Math.round(indi.x + this.boxLength + this.xGapBtwnFrames/2) * this.canvasScale, Math.round((indi.y + this.boxHeight/2) * this.canvasScale));
                    this.ctx.lineTo(Math.round((indi.x + this.boxLength + this.xGapBtwnFrames/2) * this.canvasScale), Math.round((child.y +this.boxHeight/2) * this.canvasScale));
                    this.ctx.moveTo(Math.round((indi.x + this.boxLength + this.xGapBtwnFrames/2) * this.canvasScale), Math.round((child.y + this.boxHeight/2) * this.canvasScale));
                    this.ctx.lineTo(Math.round(child.x * this.canvasScale), Math.round((child.y + this.boxHeight/2) * this.canvasScale));
                })
            }
        });
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawStrokes(indis, color) {
        this.ctx.strokeStyle = color;
        indis.forEach(indi => {
            this.ctx.strokeRect(Math.round(indi.x * this.canvasScale), Math.round(indi.y * this.canvasScale), Math.round(this.boxLength * this.canvasScale), Math.round(this.boxHeight * this.canvasScale));
        });
    }
    
    drawNames(indis, color) {
        this.ctx.fillStyle = color;
        this.setTextSettings();
        indis.forEach(indi => {
            this.ctx.fillText(indi.name, Math.round((indi.x + this.boxLength/2) * this.canvasScale), Math.round((indi.y + this.boxHeight/2) * this.canvasScale));
        });
    }

    drawIndi(indi, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(indi.x * this.canvasScale), Math.round(indi.y * this.canvasScale), Math.round(this.boxLength * this.canvasScale), Math.round(this.boxHeight * this.canvasScale));
    }

    highlightIndi(indi, color, textColor, strokesColor) {
        this.drawIndi(indi, color);
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(indi.name, Math.round((indi.x + this.boxLength/2) * this.canvasScale), Math.round((indi.y + this.boxHeight/2) * this.canvasScale));
        this.ctx.strokeStyle = strokesColor;
        this.ctx.strokeRect(Math.round(indi.x * this.canvasScale), Math.round(indi.y * this.canvasScale), Math.round(this.boxLength * this.canvasScale), Math.round(this.boxHeight * this.canvasScale));
    }

    highlightIndis(indis, color, textColor, strokesColor) {
        for (let indi of indis) {
            this.highlightIndi(indi, color, textColor, strokesColor);
        }
    }

    highlightFamily(father, color, textColor, strokesColor) {
        this.highlightIndi(father, color, textColor, strokesColor);
        father.children.forEach(child => {
            this.highlightFamily(child, color, textColor, strokesColor);
        });
    }

    drawFamily(father, color) {
        this.drawIndi(father, color);
        if (father.children.length <= 0)
            return;
        father.children.forEach(child => {
            this.drawFamily(child, color);
        });
    }

    setTextSettings() {
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = 'middle';
        this.ctx.font = 20 * this.canvasScale + "px arial";
    }

    configure() {
        this.levelX = new Array(100).fill(0);
        this.levelY = new Array(100).fill(0);
        this.ancestor = this.familyTree.getAncestor(this.familyTree.indis);
        this.familyTree.setGenerations(this.ancestor);
        this.levelX = this.familyTree.calcXwidth();
        this.familyTree.calcXY(this.ancestor, this.levelX, this.levelY, this.levelYMax, false);
        let maxX = this.getMaxLevelX();
        let maxY = this.getMaxLevelY();
        this.treeBounds = [maxX, maxY];
    }
    
    getMaxLevelY() {
        let maxY = this.levelY[0];
        for (let i = 0; i < this.levelY.length; i++) {
            if (maxY < this.levelY[i])
                maxY = this.levelY[i];
        }
    
        return maxY;
    }

    getMaxLevelX() {
        let maxX = this.familyTree.getLastGeneration(this.familyTree.indis) * (this.boxLength + this.xGapBtwnFrames);

        return maxX;
    }

    updateCanvasScale(newScale) {
        this.canvasScale = newScale;
    }
}

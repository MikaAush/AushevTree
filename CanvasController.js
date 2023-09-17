class CanvasController
{
    constructor(document, canvas, ctx, treeBuilder, familyTree, cnvXOffset, cnvYOffset, cnvActiveXOffset, cnvPassiveXOffset, cnvPassiveYOffset, canvasScale, maxScale) {
        this.document = document;
        this.canvas = canvas;
        this.ctx = ctx;
        this.treeBuilder = treeBuilder;
        this.familyTree = familyTree;
        this.cnvXOffset = cnvXOffset;
        this.cnvYOffset = cnvYOffset;
        this.cnvActiveXOffset = cnvActiveXOffset;
        this.cnvPassiveXOffset = cnvPassiveXOffset;
        this.cnvPassiveYOffset = cnvPassiveYOffset;
        this.canvasScale = canvasScale;
        this.maxScale = maxScale;
        this.foundIndis = [];
        this.relationPathMembers = [];
        this.currentFoundIndiIndex = -1;
        this.selectedIndi = null;
    }
    
    drawTree() {
        if (this.familyTree.indis.length <= 0) {
            alert("Ошибка. Попробуйте ещё раз");
            return;
        }
        
        this.setCanvasSizesAndBounds();
        this.treeBuilder.drawFamily(this.treeBuilder.ancestor, this.treeBuilder.defaultColor, this.treeBuilder.highlightColor, this.treeBuilder.highlightTextColor, this.treeBuilder.highlightStrokesColor);
        this.treeBuilder.drawLines(this.familyTree.indis, this.treeBuilder.linesColor);
        this.treeBuilder.drawStrokes(this.familyTree.indis, this.treeBuilder.strokesColor);
        this.treeBuilder.drawNames(this.familyTree.indis, this.treeBuilder.textColor);
        this.familyTree.indis.forEach(indi => {
            if (indi.highlighted)
                this.treeBuilder.highlightIndi(indi, this.treeBuilder.highlightColor, this.treeBuilder.highlightTextColor, this.treeBuilder.highlightStrokesColor);
        });
    }

    scale(newScale) {
        if (this.familyTree.indis.length <= 0) {
            alert("Ошибка. Попробуйте ещё раз");
            return;
        }
        var windowCenterX = window.scrollX / this.canvasScale;
        var windowCenterY = window.scrollY / this.canvasScale;
        console.log(windowCenterX);
        console.log(windowCenterY);
        let oldScale = this.canvasScale;
        this.updateCanvasScale(newScale);
        this.drawTree();
        scrollTo(windowCenterX * newScale + this.canvasLeft, windowCenterY * newScale + this.canvastop);
    }

    handleMouseDown(e, click) {
        let xVal = e.pageX - this.canvasLeft;
        let yVal = e.pageY - this.canvasTop;
        for (let i = 0; i < this.familyTree.indis.length; i++) {
            let indi = this.familyTree.indis[i];
            if (!this.checkClick(indi, xVal, yVal))
                continue;

            if (click == "leftMouse") {
                if (indi.name == "")
                    return;
                this.selectedIndi = indi;
                const indiElement = this.document.getElementById('indi');
                if (indiElement.className == "indi_passive") {
                    this.toggleElement('indi', 'active');
                    this.toggleElement('content', 'active');
                    this.canvasLeft += this.cnvActiveXOffset;
                }
                for (const child of indiElement.children) {
                    if (child.id == "indiName") {
                        child.innerText= indi.name;
                        continue;
                    }
                    if (child.id == "indiId") {
                        child.innerText = indi.id;
                        continue;
                    }
                }
            }
            else if (click == "rightMouse") {
                this.treeBuilder.highlightIndis(this.relationPathMembers, this.treeBuilder.defaultColor, this.treeBuilder.textColor, this.treeBuilder.strokesColor);
                this.relationPathMembers = [];
                if (this.selectedIndi == null)
                    return;

                let members = this.familyTree.getTwoIndiRelationPathMembers(this.selectedIndi, indi);
                this.relationPathMembers = members;
                members.forEach(member => {
                    member.highlighted = true;
                });
                this.treeBuilder.highlightIndis(members, this.treeBuilder.highlightColor, this.treeBuilder.highlightTextColor, this.treeBuilder.highlightStrokesColor);
            }
            return;
        } 
    }

    toggleElement(elementName, state) {
        let element = this.document.getElementById(elementName);
        
        if (state == 'passive') {
            element.classList.remove(elementName + '_active');
            element.classList.toggle(elementName + '_passive');
            return;
        }
        element.classList.remove(elementName + '_passive');
        element.classList.toggle(elementName + '_active');
    }

    checkClick(indi, x, y) {
        return (x >= indi.x * this.canvasScale && x <= (indi.x + indi.length) * this.canvasScale && y >= indi.y * this.canvasScale && y <= (indi.y + this.treeBuilder.boxHeight) * this.canvasScale);
    }

    closeIndi() {
        const indiElement = this.document.getElementById('indi');
        indiElement.classList.remove('indi_active');
        indiElement.classList.toggle('indi_passive');
        this.document.getElementById("content").classList.remove('content_active');
        this.document.getElementById("content").classList.toggle('content_passive');
        this.selectedIndi = null;
        this.canvasLeft -= this.cnvActiveXOffset;
    }

    searchIndisByName(name) {
        if (this.foundIndis.length > 0) {
            let indi = this.foundIndis[this.currentFoundIndiIndex];
            this.familyTree.getFamilyMembers(indi, [indi]).forEach(member => {
                member.highlighted = false;
            });
            this.highlightFamily(this.foundIndis[this.currentFoundIndiIndex], this.treeBuilder.defaultColor, this.treeBuilder.linesColor, this.treeBuilder.strokesColor, this.treeBuilder.linesColor, 1);
            this.foundIndis = [];
            this.currentFoundIndiIndex = -1;
        }

        this.familyTree.indis.forEach(indi => {
            if (this.compareNames(indi.name.toLowerCase(), name.toLowerCase())) {
                this.foundIndis.push(indi);
            }
        });
        
        this.foundIndis.sort((a, b) => {return b.children.length - a.children.length});

        let button = this.document.getElementById("nextFoundIndiBtn");
        if (this.foundIndis.length > 0) {
            this.nextFoundIndi();
            this.enableNextFoundIndiBtn(button);
            return;
        }
        alert("С именем " + name + " не был найден ни один человек");
        this.disableNextFoundIndiBtn(button);
    }

    compareNames(name1, name2) {
        for (let i = 0; i < name1.length - name2.length + 1; i++) {
            if (name1.substring(i, i+name2.length) == name2) {
                return true;
            }
        }

        return false;
    }

    nextFoundIndi() {
        if (this.currentFoundIndiIndex >= 0) {
            let indi = this.foundIndis[this.currentFoundIndiIndex];
            this.familyTree.getFamilyMembers(indi, [indi]).forEach(member => {
                member.highlighted = false;
            });
            this.highlightFamily(indi, this.treeBuilder.defaultColor, this.treeBuilder.textColor, this.treeBuilder.strokesColor, this.treeBuilder.linesColor, 1);
        }
        
        if (this.currentFoundIndiIndex < this.foundIndis.length-1)
            this.currentFoundIndiIndex += 1;
        else 
            this.currentFoundIndiIndex = 0;

        const indi = this.foundIndis[this.currentFoundIndiIndex];
        let [maxX, minX, maxY, minY] = this.familyTree.getFamilyBounds(indi, 0, 1000000, 0, 1000000);
        const newScale = this.calcScaleToFitBranch(maxX, minX, maxY, minY);
        this.treeBuilder.updateCanvasScale(newScale);

        this.familyTree.getFamilyMembers(indi, [indi]).forEach(member => {
            member.highlighted = true;
        });

        if (newScale != this.canvasScale) {
            this.scale(newScale);
            this.document.getElementById("scale").value = newScale * 100;
        }
        else
            this.highlightFamily(indi, this.treeBuilder.highlightColor, this.treeBuilder.highlightTextColor, this.treeBuilder.highlightStrokesColor, this.treeBuilder.highlightLinesColor, 2);

        this.scrollToIndi(maxX, minX, maxY, minY);
    }

    scrollToIndi(maxX, minX, maxY, minY) {
        let button = this.document.getElementById("nextFoundIndiBtn");
        button.setAttribute("disabled", "disabled");
        setTimeout(() => {this.enableNextFoundIndiBtn(button)}, 100);
        scrollTo((minX + (maxX - minX)/2) * this.canvasScale + this.canvasLeft - window.innerWidth/2, (minY + (maxY - minY)/2) * this.canvasScale + this.canvasTop - window.innerHeight/2);
    }

    disableNextFoundIndiBtn(button) {
        button.setAttribute("disabled", "disabled");
        button.innerText = "Заполните поле слева";
    }

    enableNextFoundIndiBtn(button) {
        button.removeAttribute("disabled");
        button.innerText = "Следующий (" + (this.currentFoundIndiIndex + 1) + "/" + this.foundIndis.length + ")";
    }

    calcScaleToFitBranch(maxX, minX, maxY, minY) {
        let newScaleX = (window.innerWidth)/(maxX - minX);
        let newScaleY = (window.innerHeight)/(maxY - minY);
        let newScale = Math.min(newScaleX, newScaleY);

        return newScale < this.maxScale ? newScale : this.maxScale;
    }

    setCanvasSizesAndBounds() {
        const newWidth = this.treeBuilder.treeBounds[0] * this.canvasScale;
        const newHeight = this.treeBuilder.treeBounds[1] * this.canvasScale;
        this.canvas.width = newWidth + this.cnvXOffset > window.innerWidth ? newWidth + this.cnvXOffset : window.innerWidth;
        this.canvas.height = newHeight + this.cnvYOffset > window.innerHeight ? newHeight + this.cnvYOffset : window.innerHeight;
        this.canvasLeft = this.cnvPassiveXOffset;
        if (this.document.getElementById("content").className == "content_active")
            this.canvasLeft += this.cnvActiveXOffset;
        this.canvasTop = this.cnvPassiveYOffset;
    }

    updateCanvasScale(newScale) {
        this.canvasScale = newScale;
    }

    highlightFamily(indi, color, textColor, strokesColor, linesColor, lineWidth) {
        this.treeBuilder.highlightFamily(indi, color, textColor, strokesColor);
        this.treeBuilder.drawLines(this.familyTree.getFamilyMembers(indi, [indi]), linesColor, lineWidth);
    }
}

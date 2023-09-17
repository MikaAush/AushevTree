let scaleSlider = document.getElementById("scale");
let newIndiNameInput = document.getElementById("newIndiNameInput");
let toggleModeBtn = document.getElementById("toggleModeBtn");
let saveBtn = document.getElementById("saveBtn");

let ctx = canvas.getContext("2d");

let canvasScale = scaleSlider.value/100;

let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;

let familyTree = new FamilyTree(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight);
let treeBuilder = new TreeBuilder(ctx, familyTree, canvasScale, boxHeight, boxLength, yGapBtwnBrothers, extraYGapBtwnCousins, xGapBtwnFrames, defaultColor, highlightColor, linesColor, highlightLinesColor, textColor, highlightTextColor, strokesColor, highlightStrokesColor, bgColor, bgLinesColor, crossesColor);
let canvasController = new CanvasController(document, canvas, ctx, treeBuilder, familyTree, cnvXOffset, cnvYOffset, cnvActiveXOffset, cnvPassiveXOffset, cnvPassiveYOffset, canvasScale, maxScale);

canvas.onclick = function(e) {
    canvasController.handleMouseDown(e)
}
scaleSlider.oninput = function() {
    if (scaleSlider.value/100 != canvasController.canvasScale) {
        updateScales(scaleSlider.value/100);
        canvasController.scale(scaleSlider.value/100);
        canvasController.setInputNameSettings(newIndiNameInput, canvasController.selectedIndi);
    }
}
newIndiNameInput.onkeydown = function(e) {
    if (e.key === 'Enter')
        changeIndiName(canvasController.selectedIndi, newIndiNameInput);
}
window.onscroll = function () {  
    canvasController.setInputNameSettings(newIndiNameInput, canvasController.selectedIndi);
}
saveBtn.onclick = function() {
    downloadFamily(familyTree.getAncestor()); 
}
toggleModeBtn.onclick = function() {
    if (canvasController.editMode == true) {
        familyTree.removeEmptyChildFromEachIndi(familyTree.indis);
        canvasController.editMode = false;
        canvasController.setInputNameSettings(newIndiNameInput, null);
        treeBuilder.configure();
        canvasController.drawTree();
        toggleModeBtn.innerText = "Редактировать";
        saveBtn.disabled = false;
        return;
    }
    else {
        enterEditMode();
        toggleModeBtn.innerText = "Готово";
        saveBtn.disabled = true;
    }
}
newIndiNameInput.style.left = '-1000px';
saveBtn.disabled = true;

let text = localStorage.getItem('textForConstructor');
parse(text);

function parse(text) {
    if (text != null) {
        familyTree.fileText = text;
        const lines = familyTree.splitOnLines(text);
        familyTree.setIndis(lines);
        enterEditMode();
    }
}

function enterEditMode() {
    canvasController.editMode = true;
    familyTree.addOneEmptyChildToEachIndi(familyTree.indis);
    treeBuilder.configure(familyTree.indis, treeBuilder.levelX, treeBuilder.levelY);
    let [maxX, minX, maxY, minY] = familyTree.getFamilyBounds(familyTree.getAncestor(), 0, 1000000, 0, 1000000);
    let newScale = canvasController.calcScaleToFitBranch(maxX, minX, maxY, minY);
    updateScales(newScale);
    canvasController.scale(newScale);
    scaleSlider.value = newScale * 100;
}

function downloadFamily(ancestor) {
    const text = familyTree.unloadBranchToFile(ancestor);
    const blob = new Blob([text], {type:'text/plain'});
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = ancestor.name+".ged";
    link.click();
    URL.revokeObjectURL(link.href);
}

function updateScales(newScale) {
    treeBuilder.updateCanvasScale(newScale);
    canvasController.updateCanvasScale(newScale);
}

function changeIndiName(indi, newIndiNameInput) {
    if (newIndiNameInput.value.trim() != "") {
        let isNewChild = false;
        if (indi.name == "")
            isNewChild = true;
        indi.setName(familyTree.correctName(newIndiNameInput.value));
        newIndiNameInput.value = ""; 
        canvasController.setInputNameSettings(newIndiNameInput, null);
        if (isNewChild) {
            familyTree.addOneEmptyChildToEachIndi([indi.father, indi]);
            treeBuilder.configure(familyTree.indis, treeBuilder.levelX, treeBuilder.levelY);
        }
        canvasController.selectedIndi = null;
        canvasController.drawTree();
    }
}

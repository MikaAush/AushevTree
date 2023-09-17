let fileSelector = document.getElementById("file-selector");
let canvas = document.getElementById("canvas");
let drawTreeBtn = document.getElementById("drawTreeBtn");
let scaleSlider = document.getElementById("scale");
let indiSearchInputName = document.getElementById("indiSearchInputName");
let nextFoundIndiBtn = document.getElementById("nextFoundIndiBtn");
let closeIndiBtn = document.getElementById("closeIndiBtn");
let downloadFamilyBtn = document.getElementById("downloadFamilyBtn");
let editFamilyBtn = document.getElementById("editFamilyBtn");
let updateBranchInput = document.getElementById("updateBranchInput");

var ctx = canvas.getContext("2d");

let canvasScale = document.getElementById("scale").value/100;

let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;

let familyTree = new FamilyTree(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight);
let treeBuilder = new TreeBuilder(ctx, familyTree, canvasScale, boxHeight, boxLength, yGapBtwnBrothers, extraYGapBtwnCousins, xGapBtwnFrames, defaultColor, highlightColor, linesColor, highlightLinesColor, textColor, highlightTextColor, strokesColor, highlightStrokesColor, bgColor, bgLinesColor);
let canvasController = new CanvasController(document, canvas, ctx, treeBuilder, familyTree, cnvXOffset, cnvYOffset, cnvActiveXOffset, cnvPassiveXOffset, cnvPassiveYOffset, canvasScale, maxScale);

fileSelector.onchange = function() {parse(fileSelector, familyTree); fileSelector.remove()};
canvas.onclick = function(e) {canvasController.handleMouseDown(e, "leftMouse")};
canvas.oncontextmenu = function(e) {canvasController.handleMouseDown(e, "rightMouse")};
drawTreeBtn.onclick = function() {drawTreeBtn.remove(); treeBuilder.configure(familyTree.indis, treeBuilder.levelX, treeBuilder.levelY); canvasController.drawTree()};
scaleSlider.oninput = function() {if (scaleSlider.value/100 != canvasController.canvasScale) {updateScales(scaleSlider.value/100); canvasController.scale(scaleSlider.value/100)}};
indiSearchInputName.onkeydown = function(e) {
    if (e.key === 'Enter')
        searchIndiFrameByName(indiSearchInputName.value);
}
nextFoundIndiBtn.onclick = function() {nextFoundIndi()};
closeIndiBtn.onclick = function() {canvasController.closeIndi()};
downloadFamilyBtn.onclick = function() {downloadFamily(canvasController.selectedIndi, familyTree)};
editFamilyBtn.onclick = function() {openFamilyConstructor(canvasController.selectedIndi)}; 

canvasController.disableNextFoundIndiBtn(nextFoundIndiBtn);

let familyBranch = new FamilyTree(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight);

updateBranchInput.onchange = function() {
    let file = updateBranchInput.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onloadend = function() {
        const text = reader.result;
        if (text != undefined) {
            const lines = familyTree.splitOnLines(text);
            familyBranch.setIndis(lines);
            familyTree.concat2FamilyTrees(familyTree, familyBranch);
            downloadFamily(familyTree.getAncestor(), familyTree);
        }
    }
};

function parse(input, familyTree) {
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onloadend = function() {
        const text = reader.result;
        if (text != undefined) {
            const lines = familyTree.splitOnLines(text);
            familyTree.setIndis(lines);
            console.log(familyTree.indis.length);
        }
    }
}

function downloadFamily(ancestor, familyTree) {
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

function searchIndiFrameByName(name) {
    canvasController.searchIndisByName(name);
}

function nextFoundIndi() {
    canvasController.nextFoundIndi();
}

function openFamilyConstructor(ancestor) {
    localStorage.setItem('textForConstructor', familyTree.unloadBranchToFile(ancestor));
    window.open('https://github.com/MikaAush/AushevTree/blob/main/ConstructorMain.html');
}

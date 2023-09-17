let fileSelector1 = document.getElementById("file-selector1");
let fileSelector2 = document.getElementById("file-selector2");
let submitBtn = document.getElementById("submitBtn")

let parser1 = new Parser(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight);
let parser2 = new Parser(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight);

fileSelector1.onchange = parse1;
fileSelector2.onchange = parse2;
submitBtn.onclick = concat;

function parse1() {
    const input = document.getElementById("file-selector1");
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onloadend = () => {
        const text = reader.result;
        if (text != undefined) {
            const lines = parser1.splitOnLines(text);
            parser1.setIndis(lines);
            
            input.remove();
          }
    }
}

function parse2() {
    const input = document.getElementById("file-selector2");
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onloadend = () => {
        const text = reader.result;
        if (text != undefined) {
            const lines = parser2.splitOnLines(text);
            parser2.setIndis(lines);
            
            input.remove();
          }
    }
}

function concat() {
    let newParser = new Parser(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight);

    newParser.concat2Parsers(parser1, parser2);
    downloadFamily(newParser.getAncestor(), newParser);
}

function downloadFamily(ancestor, newParser) {
    const text = newParser.unloadBranchToFile(ancestor);
    const blob = new Blob([text], {type:'text/plain'});
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = ancestor.name+".ged";
    link.click();
    URL.revokeObjectURL(link.href);
}

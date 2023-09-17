class FamilyTree
{
    constructor(xGapBtwnFrames, yGapBtwnBrothers, extraYGapBtwnCousins, boxLength, boxHeight) {
        this.indis = [];
        this.xGapBtwnFrames = xGapBtwnFrames;
        this.yGapBtwnBrothers = yGapBtwnBrothers;
        this.extraYGapBtwnCousins = extraYGapBtwnCousins;
        this.boxLength = boxLength;
        this.boxHeight = boxHeight;
        this.fileText = '';
    }

    getIndiById(id) {
        for(let i = 0; i < this.indis.length; i++) {
            if (this.indis[i].id == id)
                return this.indis[i];
        }

        return "None";
    }

    getIdFromLine(line) {
        let bounds = [-1, -1];

        for (let c = 0; c < line.length; c++) {
            if (line[c] == "@") {
                if (bounds[0] == -1)
                    bounds[0] = c;
                else
                    bounds[1] = c;
            }
        }

        return line.substring(bounds[0]+1, bounds[1]);
    }

    correctName(name) {
        let result = "";
        let wthtSlashes = "";
        name = name.trim();
        for (let i = 0; i < name.length; i++) {
            if (name[i] == "/")
                continue;
            wthtSlashes += name[i];
        }
        name = wthtSlashes;
        for (let i = 0; i < name.length; i++) {
            if (i == 0) {
                result += name[0].toUpperCase();
                continue;
            }
            if (name[i-1] == "-" || name[i-1] == "(" || name[i-1] == ",") {
                result += name[i].toUpperCase();
                continue;
            }
            if (name[i] == "I") {
                result += name[i];
                continue;
            }
            result += name[i].toLowerCase();
        }
        result = result.trim();
        
        return result;
    }
    
    setIndis(fileLines) {
        for (let i = 0; i < fileLines.length; i++) {
            let line = fileLines[i];
            if (line.length == 0)
                continue;
            if (line[0] != "0")
                continue;
            if (line.substring(line.length-5, line.length-1) == "INDI") {
                let id = this.getIdFromLine(line);
                let name = this.correctName(fileLines[i+1].substring(7, fileLines[i+1].length));
                const new_indi = new Indi(id, name, this.boxLength, this.boxHeight);
                this.indis.push(new_indi);
            }
            
            else if (line.substring(line.length-4, line.length-1) == "FAM") {
                let father = null;
                if (fileLines[i+1].substring(2, 6) == "HUSB")
                    father = this.getIndiById(this.getIdFromLine(fileLines[i+1]));
                else
                    continue;
                i += 1;
                while (i+1 < fileLines.length && fileLines[i+1].substring(2, 6) == "CHIL") {
                    let child = this.getIndiById(this.getIdFromLine(fileLines[i+1]));
                    child.assignFather(father);
                    child.ancestor = false;
                    father.appendChild(child);
                    i += 1;
                }
            }
        }
    }

    splitOnLines(file) {
        let lines = [];
        let pointer = -1;
        for (let i = 0; i < file.length; i++) {
            if (file[i] != "\r" && file[i] != "\n") {
                continue;
            }
            const line = file.substring(pointer+1, i+1);
            lines.push(line);
            pointer = i;
        }      
    
        return lines;
    }
    
    getAncestor() {
        for (let i = 0; i < this.indis.length; i++) {
            const indi = this.indis[i];
            if (indi.ancestor)
                return indi;
        }
    }

    getLastGeneration() {
        let lastGen = 0;
        this.indis.forEach(indi => {
            if (indi.generation > lastGen)
                lastGen = indi.generation;
        });

        return lastGen;
    }
    
    setGenerations(ancestor) {
        ancestor.children.forEach((child) => {
            child.generation = ancestor.generation + 1;
            this.setGenerations(child);
        });
    }

    calcXY(indi, levelX, levelY, levelYMax, firstChild) {
        indi.x = levelX[indi.generation];
        if (indi.father != null)
            indi.y = Math.max(levelY[indi.generation], indi.father.y, levelYMax[0]);
        else
            indi.y = levelY[indi.generation];
        
        // extra gap between cousins
        if (firstChild == true)
            if (levelY[indi.generation] < indi.y + this.extraYGapBtwnCousins)
                levelY[indi.generation] = indi.y + this.extraYGapBtwnCousins;
        
        // if (levelYMax[0] < indi.y)
        //     levelYMax[0] = indi.y;
        
        firstChild = true;
        indi.children.forEach((child) => {
            this.calcXY(child, levelX, levelY, levelYMax, firstChild);
            firstChild = false;
        });
        
        indi.updateY(levelY);
        
        // gap between brothers
        if (levelY[indi.generation] < indi.y + boxHeight + this.yGapBtwnBrothers)
            levelY[indi.generation] = indi.y + boxHeight + this.yGapBtwnBrothers;
    }

    calcXwidth() {
        let levelX = new Array(100).fill(0);
        for (let i = 0; i < 100; i++){
            levelX[i] = (boxLength + this.xGapBtwnFrames)*i;
        }

        return levelX;
    }

    getFamilyMembers(father, members, exception) {
        father.children.forEach(child => {
            if (exception != null && child.id != exception.id) {
                members.push(child);
                if (child.children.length > 0)
                    members = this.getFamilyMembers(child, members);
            }
            else if (exception == null) {
                members.push(child);
                if (child.children.length > 0)
                    members = this.getFamilyMembers(child, members);
            }
        });

        return members;
    }

    unloadIndiToFile(indi) {
        let indiText = "\n0 @"+indi.id+"@ INDI\n1 NAME "+indi.name+"\n";
        if (indi.children.length > 0) 
            indiText += "1 FAMS @"+indi.id+"@\n";
        if (indi.father != undefined & indi.father != null)
            indiText += "1 FAMC @"+indi.father.id+"@\n";
        
        return indiText;
    }

    unloadFamilyToFile(father) {
        let famText = "\n0 @"+father.id+"@ FAM\n1 HUSB @"+father.id+"@\n";
    
        father.children.forEach(child => {
            if (child.name != '')
                famText += "1 CHIL @"+child.id+"@\n";
        });
    
        father.children.forEach(child => {
            if (child.children.length > 0 && child.children[0].name != "")
                famText += this.unloadFamilyToFile(child);
        });
    
        return famText;
    }
    
    unloadBranchToFile(ancestor) {
        let text = "0 HEAD\n1 GEDC\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n";
        let branch_members = this.getFamilyMembers(ancestor, [ancestor]);
        branch_members.forEach(member => {
            if (member.name != '')
                text += this.unloadIndiToFile(member, text);
        });
    
        if (ancestor.children.length > 0)
            text += this.unloadFamilyToFile(ancestor);

        return text;
    }

    getFamilyBounds(father, maxX, minX, maxY, minY) {
        if (father.x + this.boxLength > maxX) 
            maxX = father.x + this.boxLength;
        if (father.x < minX) 
            minX = father.x;
        if (father.y + this.boxHeight > maxY)
            maxY = father.y + this.boxHeight;
        if (father.y < minY)
            minY = father.y;
    
        father.children.forEach(child => {
            [maxX, minX, maxY, minY] = this.getFamilyBounds(child, maxX, minX, maxY, minY);
        });

        return [maxX, minX, maxY, minY];
    }

    concat2FamilyTrees(mainFamilyTree, childFamilyTree) {
        let childAncestor = childFamilyTree.getAncestor();
        if (childAncestor == null)
            return;
        if (mainFamilyTree.getIndiById(childAncestor.id) == "None")
            return;
        
        let mainAncestor = mainFamilyTree.getAncestor();
        let branch_members = mainFamilyTree.getFamilyMembers(mainAncestor, [mainAncestor], childAncestor);
        mainFamilyTree.getIndiById(childAncestor.id).children = childAncestor.children;
        
        childFamilyTree.getFamilyMembers(childAncestor, [childAncestor], null).forEach(member => {
            if (member.id != childAncestor.id)
                branch_members.push(member);
        });

        this.indis = branch_members;
    }

    addOneEmptyChildToEachIndi(indis) {
        indis.forEach(indi => {
            let newChild = new Indi(Math.floor(Math.random() * 10**16).toString(), "", this.boxLength, this.boxHeight);
            this.setChildSettings(newChild, indi);
            indi.children.push(newChild);
            this.indis.push(newChild);
        });
    }

    setChildSettings(child, father) {
        child.father = father;
        child.generation = father.generation + 1;
    }

    removeEmptyChildFromEachIndi(indis) {
        indis.forEach(indi => {
            for (let i = 0; i < indi.children.length; i++) {
                if (indi.children[i].name == "") {
                    let emptyChildIndex = this.indis.indexOf(indi.children[i]);
                    this.indis.splice(emptyChildIndex, 1);
                    indi.children.splice(i, 1);
                }
            }
        });
    }

    getTwoIndiRelationPathMembers(indi1, indi2) {
        let members = [indi1, indi2];
        if (indi1.generation > indi2.generation) { 
            members = this.getAncestorsOfIndiUpToGeneration(indi1, indi2.generation, members);
            members = this.getAllAncestorsUpToGeneralAncestor(indi2, members[members.length-1], members);
        }
        else if (indi2.generation > indi1.generation) { 
            members = this.getAncestorsOfIndiUpToGeneration(indi2, indi1.generation, members);
            members = this.getAllAncestorsUpToGeneralAncestor(indi1, members[members.length-1], members);
        }

        return members;
    }
    
    getAllAncestorsUpToGeneralAncestor(indi1, indi2, members) {
        if (indi1.father != null) {
            members.push(indi1.father);
            if (indi2.father != null && indi2.father != indi1.father) {
                members.push(indi2.father);
                members = this.getAllAncestorsUpToGeneralAncestor(indi1.father, indi2.father, members);
            }
        }

        return members;
    }

    getAncestorsOfIndiUpToGeneration(indi, generation, members) {
        if (indi.father.generation + 1 != generation) {
            members.push(indi.father);
            members = this.getAncestorsOfIndiUpToGeneration(indi.father, generation, members);
        }

        return members;
    }
}

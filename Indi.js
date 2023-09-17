class Indi
{
    constructor(id, name, boxLength, boxHeight) {
        this.id = id;
        this.name = name;
        this.generation = 0;
        this.father = null;
        this.children = [];
        this.famc = "";
        this.fams = "";
        this.x = 10;
        this.y = 10;
        this.length = boxLength;
        this.height = boxHeight;
        this.ancestor = true;
        this.highlighted = false;
    }

    assignFather(father) {
        this.father = father;
        if (father != null) {
            this.generation = father.generation + 1;
        }
    }

    appendChild(child) {
        this.children.push(child);
    }

    updateY() {
        if (this.children.length != 0) {
            let max_y = -1;
            let min_y = this.children[0].y;
            this.children.forEach ((child) => {
                if (child.y > max_y) {
                    max_y = child.y;
                }
                if (child.y < min_y) {
                    min_y = child.y;
                }
            })
            this.y = (max_y + min_y)/2;
        }
    }

    setName(name) {
        this.name = name;
    }
}

import { Units } from "./Units.js";

export class Grid {
    constructor(isClone = false) { 
        this.clone = isClone;
        this.units = new Units();
        this.units.inputs = document.querySelectorAll('.unit-value');

        this.updatingLayout  = false;
        this.updatingPresets = false;
        this.pageLayout = this.#initPageLayout();
        this.gridDesign = this.#initGridDesign();   
        this.pdfOptions = this.#initPdfOptions();
        this.buttons    = this.#initButtons();

        this.page = document.getElementById('page');
        this.grid    = document.getElementById('preview');
        this.loaded  = true;

        this.updatePresetText();
        this.refreshPreview();
    }
    
    #initPageLayout() {
        const self = this;
        
        const pageLayout = {
            dimensions: {
                elements: {
                    x: document.getElementById('page-width'),
                    y: document.getElementById('page-height'),
                }
            },
            margins: {
                elements: {
                    top: document.getElementById('margin-top'),
                    right: document.getElementById('margin-right'),
                    bottom: document.getElementById('margin-bottom'),
                    left: document.getElementById('margin-left'),
                    x: document.getElementById('margin-x'),
                    y: document.getElementById('margin-y')
                },
                get linkedX() { return document.getElementById('linked-x').checked; },
                get linkedY() { return document.getElementById('linked-y').checked; }
            },
            presets: document.getElementById('presets'),
            get orientation() { return document.querySelector('input[name="orientation"]:checked').id; }
        };

        Object.defineProperty(pageLayout, 'format', {
            get() { return pageLayout.presets.options[pageLayout.presets.selectedIndex]; }
        });

        ['dimensions', 'margins'].forEach((key) => {
            Object.defineProperties(pageLayout[key], {
                x: { get() { return parseFloat(pageLayout[key].elements.x.value) } },
                y: { get() { return parseFloat(pageLayout[key].elements.y.value) } },
                pxX: { get() { return self.units.toPx(pageLayout[key].x); } },
                pxY: { get() { return self.units.toPx(pageLayout[key].y); } }
            });
        });

        ['Top', 'Right', 'Bottom', 'Left'].forEach((dir) => {
            Object.defineProperty(pageLayout.margins, 'px'+dir, {
                get() { return self.units.toPx(pageLayout.margins.elements[dir.toLowerCase()].value); }
            });
        });

        const marginFieldset = document.getElementById('margin-fieldset');

        const linkedMarginsCheckboxes = document.querySelectorAll('.link-icon__checkbox');
        linkedMarginsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // make sure the split margins' values match the linked one when splitting up
                if (!checkbox.checked) {
                    const targets = checkbox.dataset.type === 'x' ? ['left', 'right'] : ['top', 'bottom'];
                    targets.forEach((target) => {
                        pageLayout.margins.elements[target].value = pageLayout.margins[checkbox.dataset.type];
                    });
                }
                marginFieldset.setAttribute('data-' + checkbox.dataset.type + '-linked', checkbox.checked);
            })
        });

        const marginLinks = document.querySelectorAll('.link-margins');
        marginLinks.forEach(link => {
            const checkbox = document.getElementById("linked-" +link.dataset.type);
            link.addEventListener('click', () => {
                checkbox.click();
                const valueToCopy = pageLayout.margins.elements[link.dataset.copyFrom].value;
                pageLayout.margins.elements[link.dataset.copyTo].value = valueToCopy;
                pageLayout.margins.elements[link.dataset.type].value = valueToCopy;
            });
        });

        const orientations = document.querySelectorAll('input[name="orientation"]');
        orientations.forEach(orientation => {
            orientation.addEventListener('change', () => {
                this.switchOrientation(orientation.id);
            });
        });

        const width   = pageLayout.dimensions.elements.x;
        const height  = pageLayout.dimensions.elements.y;

        // Update selected preset when width/height is changed
        [width, height].forEach(dimension => {
            dimension.addEventListener('change', () => {
                this.updatePresets();
            });
        });

        pageLayout.presets.addEventListener('change', (e) => {
            if (this.updatingPresets) return;
    
            const selected = e.target.options[e.target.selectedIndex];
    
            if (selected.id === "custom") return;
            
            const abbrv = this.units.currentAbbrv;
            const x = parseFloat(selected.dataset[abbrv+"X"]);
            const y = parseFloat(selected.dataset[abbrv+"Y"]);
            const portrait = this.isPortrait();
    
            pageLayout.dimensions.elements.x.value  = portrait ? x : y;
            pageLayout.dimensions.elements.y.value  = portrait ? y : x;
            this.refreshPreview();
        });

        return pageLayout;
    }
    
    #initGridDesign() {
        const self = this;

        const designOptions = {
            sizes: {
                elements: {
                    cell: document.getElementById('cell-size'),
                    colGap: document.getElementById('col-gap'),
                    rowGap: document.getElementById('row-gap')
                }
            },
            colors: {
                elements: {
                    main: document.getElementById('color-main'),
                    sub: document.getElementById('color-sub'),
                    subber: document.getElementById('color-subber'),
                }
            },
            lineTypes: {
                fieldset: {
                    sub: document.getElementById('line-type_sub'),
                    subber: document.getElementById('line-type_subber')
                },
                get sub() { return document.querySelector('input[name="sub_line-type"]:checked').value || 'dashed'; },
                get subber() { return document.querySelector('input[name="subber_line-type"]:checked').value || 'dashed'; }
            },
            vocab: {
                elements: {
                    words: document.getElementById('vocab-list'),
                    gap: document.getElementById('word-gap')
                },
                get direction() { return document.querySelector('input[name="direction"]:checked').id },
                characters: []
            },
            get style() { return document.querySelector('input[name="grid-style"]:checked').value || 'quad'; }
        };

        Object.defineProperties(designOptions.sizes, {
            cell:   { get() { return parseFloat(designOptions.sizes.elements.cell.value); } },
            colGap: { get() { return parseInt(designOptions.sizes.elements.colGap.value); } },
            rowGap: { get() { return parseInt(designOptions.sizes.elements.rowGap.value); } },
            cellPx: { get() { return self.units.toPx(designOptions.sizes.cell); } }
        });

        Object.defineProperties(designOptions.colors, {
            main:   { get() { return designOptions.colors.elements.main.value; } },
            sub:    { get() { return designOptions.colors.elements.sub.value; } },
            subber: { get() { return designOptions.colors.elements.subber.value; } },
        });

        Object.defineProperties(designOptions.vocab, {
            gap:   { get() { return parseInt(designOptions.vocab.elements.gap.value); } },
            words: { get() { return designOptions.vocab.elements.words.children; } },
            ltr:   { get() { return designOptions.vocab.direction === 'ltr'; } }
        });

        const styles = document.querySelectorAll('input[name="grid-style"]');
        styles.forEach(style => {
            style.addEventListener('change', (e) => {
                this.grid.setAttribute('data-style', e.target.value);
            });
        });

        const colors = document.querySelectorAll('input[type="color"]');
        colors.forEach(color => {
            color.addEventListener('change', () => {
                this.updateGridColors();
            });
        });

        const lineTypes = document.querySelectorAll('.config__row__line-type input[type="radio"]');
        lineTypes.forEach(type => {
            type.addEventListener('change', () => {
                this.updateGridLineStyle();
            });
        });

        return designOptions;
    }
    
    #initPdfOptions() {
        const self = this;
        const gridOptions = this.gridDesign;
        
        const pdfOptions = {
            quality: {
                elements: {
                    scale: document.getElementById('scale'),
                    dpi: document.getElementById('dpi')
                }
            },
            filename: {
                element: document.getElementById('pdf-name')
            }
        };

        Object.defineProperties(pdfOptions.quality, {
            scale: { get() { return parseInt(pdfOptions.quality.elements.scale.value); } },
            dpi:   { get() { return parseInt(pdfOptions.quality.elements.dpi.value); } }
        });

        ['dimensions', 'size', 'gap', 'style'].forEach((option) => {
            Object.defineProperty(pdfOptions.filename, option, {
                get() { return document.getElementById(option)?.checked || false; }
            });
        });

        Object.defineProperty(pdfOptions.filename, 'name', {
            get() {
                let filename = "genkouyoushi";

                if (pdfOptions.filename.dimensions) {
                    const format = self.pageLayout.format
                    const dimensions = 
                        format.classList.contains('custom') 
                            ? self.pageLayout.dimensions.x + "x" + self.pageLayout.dimensions.y
                            : format.id;
                    filename += `_${dimensions.replaceAll(".", "-")}`;
                }

                if (pdfOptions.filename.size) {
                    const cellSize = `${gridOptions.sizes.cell}`;
                    filename += `_${cellSize.replace(".", "-")}${self.units.currentAbbrv}`;
                }
                
                if (pdfOptions.filename.gap) {
                    filename += `_${gridOptions.sizes.colGap}px`;
                }
                
                if (pdfOptions.filename.style) {
                    filename += `_${gridOptions.style}`;
                }

                return filename + ".pdf"
            }
        });

        return pdfOptions;
    }

    #initButtons() {
        const buttons = document.querySelectorAll('.onclick');

        buttons.forEach(button => {
            const method = button.id;

            if (typeof this[method] === 'function') {
                button.addEventListener('click', this[method].bind(this));
            }
            else {
                console.warn(`Method name ${method} does not exist in Grid class`);
            }
        });
    }

    columns() {
        if (this.gridDesign.vocab.ltr && this.wordCount()) {
            return this.wordCount();
        }
        
        const borderWidth = 1;
        const colGap = this.wordCount() ? 0 : parseInt(this.gridDesign.sizes.colGap);
        // const gridWidthPx = Math.floor(this.pageLayout.dimensions.pxX - 2 * this.pageLayout.margins.pxX);
        const gridWidthPx = Math.floor(this.grid.offsetWidth);
        return Math.floor(gridWidthPx / (this.gridDesign.sizes.cellPx + borderWidth + colGap));
    }

    rows() {
        if (!this.gridDesign.vocab.ltr && this.wordCount()) {
            return this.wordCount();
        }
        const borderWidth = 1;
        const rowGap = this.wordCount() ? 0 : parseInt(this.gridDesign.sizes.rowGap);
        // const gridHeightPx = Math.floor(this.pageLayout.dimensions.pxY - 2 * this.pageLayout.margins.pxY);
        const gridHeightPx = Math.floor(this.grid.offsetHeight);
        return Math.floor(gridHeightPx / (this.gridDesign.sizes.cellPx + borderWidth + rowGap));
    }

    wordCount() {
        return this.gridDesign.vocab.words.length;
    }

    async refreshPreview() {
        this.updatePageLayout();
        this.updateGridSize();
        this.updateGridStyle();
        this.updateGridColors();
        this.updateGridLineStyle();
        this.createGridCells();
        this.updateFilename();
    }

    updatePageLayout() {
        this.updatingLayout = true;
        this.page.style.width = this.pageLayout.dimensions.pxX + "px";
        this.page.style.height = this.pageLayout.dimensions.pxY + "px";
        let top, right, bottom, left;

        if (this.pageLayout.margins.linkedX) {
            left = right = this.pageLayout.margins.pxX;
        }
        else {
            left = this.pageLayout.margins.pxLeft;
            right = this.pageLayout.margins.pxRight;
        }

        if (this.pageLayout.margins.linkedY) {
            top = bottom = this.pageLayout.margins.pxY;
        }
        else {
            top    = this.pageLayout.margins.pxTop;
            bottom = this.pageLayout.margins.pxBottom;
        }

        this.page.style.paddingInline = `${right}px ${left}px`; 
        this.page.style.paddingBlock  = `${top}px ${bottom}px`; 

        this.updateOrientation();

        this.updatingLayout = false;
    }

    updateOrientation() {
        if (this.pageLayout.orientation === 'portrait' && !this.isPortrait()) {
            const landscape = document.getElementById('landscape');
            landscape.click();
        }
        else if (this.pageLayout.orientation === 'landscape' && this.isPortrait()) {
            const portrait = document.getElementById('portrait');
            portrait.click();
        }
    }

    updateGridSize() {
        const cellPx = this.gridDesign.sizes.cellPx;
        const ltr    = this.gridDesign.vocab.ltr;
        
        this.grid.style.setProperty('--main', Math.floor(cellPx) + "px");
        this.grid.setAttribute('data-direction', this.gridDesign.vocab.direction);

        let columnTemplate = "unset";
        let rowTemplate    = "unset";
        let colGap = this.gridDesign.sizes.colGap;
        let rowGap = this.gridDesign.sizes.rowGap;

        if (this.wordCount()) {
            colGap = this.gridDesign.vocab.gap;
            rowGap = this.gridDesign.vocab.gap;

            let words = Array.prototype.slice.call(this.gridDesign.vocab.words);
            let totalSize = 0;

            words = words.map((word) => {
                const input = word.querySelector('input');
                return parseInt(input.value);
            });

            let maxSize = ltr
                            ? this.pageLayout.dimensions.pxX - 2 * this.pageLayout.margins.pxX
                            : this.pageLayout.dimensions.pxY - 2 * this.pageLayout.margins.pxY;

            words = words.map(word => {
                if (totalSize >= maxSize) return null;
                const wordSize = word * cellPx + this.gridDesign.vocab.gap;
                
                if (totalSize + wordSize > maxSize) return null;
                totalSize += wordSize;
                
                return word;
            })
            .filter(word => word !== null);

            this.gridDesign.vocab.characters = words;
            
            const template = words.map((word) => (word * cellPx) + "px");

            if (this.gridDesign.vocab.ltr) columnTemplate = template.join(" ");
            else rowTemplate = template.join(" ");
        }
        else {
            columnTemplate = `repeat(${this.columns()}, ${cellPx}px)`;
            rowTemplate    = `repeat(${this.rows()}, ${cellPx}px)`;
        }

        this.grid.style.columnGap           = `${colGap}px`;
        this.grid.style.rowGap              = `${rowGap}px`;
        this.grid.style.gridTemplateColumns = columnTemplate;
        this.grid.style.gridTemplateRows    = rowTemplate;

        if (this.gridDesign.sizes.colGap == 0) {
            this.grid.classList.add('no-gap');
        }
        else {
            this.grid.classList.remove('no-gap');
        }
    }

    updateGridStyle() {
        ['none', 'quad', 'hexa'].forEach((type) => {
            if (type === this.gridDesign.style) {
                this.grid.classList.add(type);
            }
            else {
                this.grid.classList.remove(type);
            }
        });
    }

    updateGridColors() {
        const colors = [
            'main',
            'sub',
            'subber'
        ];
          
        colors.forEach((type) => {
            this.grid.style.setProperty(
                `--${type}_c`, 
                this.gridDesign.colors[type]
            );
        });
    }

    updateGridLineStyle() {
        this.grid.style.setProperty('--sub_style', this.gridDesign.lineTypes.sub);
        this.grid.style.setProperty('--subber_style', this.gridDesign.lineTypes.subber);
    }

    createGridCells() {
        const ltr   = this.gridDesign.vocab.ltr;
        const rows  = this.rows();
        const cols  = this.columns();
        let   cells = [];

        const words = this.gridDesign.vocab.words;

        if (words.length) {
            for (const charCount of this.gridDesign.vocab.characters) {
                const wordWrapper = document.createElement('div');
                wordWrapper.classList.add('cell-group-wrapper');

                for (let i = 0; i < charCount; i++) {
                    const group = document.createElement('div');
                    group.classList.add('cell-group');
                    group.append(...this.createGridCellGroup(
                        ltr ? rows : 1,
                        ltr ? 1 : cols
                    ));
                    wordWrapper.append(group);
                }
                cells.push(wordWrapper);
            }
        }
        else {
            cells = this.createGridCellGroup(rows, cols);
        }

        this.grid.replaceChildren(...cells);
    }

    createGridCellGroup(rows = 1, cols = 1) {
        const cells = [];

        for (let i = 0; i < (rows * cols); i++) {
            const classes = [];

            if (!this.wordCount()) {
                if (this.gridDesign.sizes.rowGap > 0 || (i + 1) % rows === 0) {
                    classes.push('last-in-column');
                }
    
                if (this.gridDesign.sizes.colGap == 0 && cols - (i / rows) <= 1) {
                    classes.push('last-column');
                }
            }

            cells.push(this.createGridCell(classes));
        }

        return cells;
    }

    createGridCell(classes = []) {
        const cell = document.createElement('div');
        cell.classList.add('genkouyoushi-cell');

        classes.forEach(className => {
            cell.classList.add(className);
        });

        const quadLines = document.createElement('div');
        quadLines.classList.add('quad-lines');
        cell.appendChild(quadLines);

        const hexaLines = document.createElement('div');
        hexaLines.classList.add('hexa-lines');
        cell.appendChild(hexaLines);

        return cell;
    }

    createWordWrapper() {

    }

    updateFilename() {
        this.pdfOptions.filename.element.innerText = this.pdfOptions.filename.name;
    }

    async generatePDF() {
        await this.refreshPreview()

        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        let dpi = parseInt(this.pdfOptions.quality.dpi);
        if (!this.units.isInches()) dpi = this.units.round((dpi / 25.4), 100);

        // Define the target PDF page dimensions and quality
        const pageWidth  = parseFloat(this.pageLayout.dimensions.x) * dpi;
        const pageHeight = parseFloat(this.pageLayout.dimensions.y) * dpi;
        const page       = pdfDoc.addPage([pageWidth, pageHeight]);

        // Capture the content using html2canvas
        const canvas   = await html2canvas(this.page, { scale: this.pdfOptions.quality.scale });
        const imgData  = canvas.toDataURL('image/png');
        const pngImage = await pdfDoc.embedPng(imgData);

        const xOffset = 0;
        const yOffset = 0;

        // Draw the image at the calculated size
        page.drawImage(pngImage, {
            x: xOffset,
            y: yOffset,
            width: pageWidth,
            height: pageHeight
        });
    
        // Save and download the PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.pdfOptions.filename.name;
        link.click();
    }

    updatePresets() {
        this.updatingPresets = true;

        let preset = 'Custom';
        const isPortrait = this.isPortrait();
        const abbrv = this.units.currentAbbrv;

        const x = isPortrait ? this.pageLayout.dimensions.x : this.pageLayout.dimensions.y;
        const y = isPortrait ? this.pageLayout.dimensions.y : this.pageLayout.dimensions.x;

        for (let i = 0; i < this.pageLayout.presets.options.length; i++) {
            const option = this.pageLayout.presets.options[i];
            
            if (option.id === 'custom') break;

            if (x == option.dataset[abbrv + "X"] && y == option.dataset[abbrv + "Y"]) {
                preset = option.value;
                break;
            }
        }

        this.pageLayout.presets.value = preset;
        this.updatingPresets = false;

        if (this.pageLayout.orientation === 'portrait' && !isPortrait || this.pageLayout.orientation === 'landscape' && isPortrait) {
            this.updatingLayout = true;
            this.updateOrientation();
            this.updatingLayout = false;
        }
    }

    updatePresetText() {
        for (let i = 0; i < this.pageLayout.presets.options.length; i++) {
            const option = this.pageLayout.presets.options[i];
    
            if (option.id === "custom") continue;
    
            const abbrv = this.units.currentAbbrv;
            option.innerText = `${option.value} (${option.dataset[abbrv+"X"]} x ${option.dataset[abbrv+"Y"]})`;
        }
    }

    isPortrait() {
        return (this.pageLayout.dimensions.x <= this.pageLayout.dimensions.y);
    }

    switchOrientation(newOrientation) {
        if (this.updatingLayout) return;

        const width  = this.pageLayout.dimensions.elements.x;
        const height = this.pageLayout.dimensions.elements.y;
        let temp;

        switch (true) {
            case newOrientation === 'portrait' && !this.isPortrait(): 
            case newOrientation === 'landscape' && this.isPortrait():
                temp = width.value;
                width.value = height.value;
                height.value = temp;
                this.refreshPreview();
                break;
        }
    }

    switchUnits(abbrv) {
        const toInches = abbrv === 'in';
        const isPortrait = this.isPortrait();
        this.units.setCurrent(abbrv);
        
        this.units.inputs.forEach((input) => {
            let newValue;

            // use formula conversion on cell size or width/height when the selected preset is 'custom'
            if (!input.classList.contains('dimension') || this.pageLayout.format.id === 'custom') {
                newValue = toInches ? this.units.mmToIn(input.value) : this.units.inToMm(input.value);
            }
            // otherwise, use the data attributes from the selected preset
            else {
                switch (true) {
                    case input.dataset.axis === 'x':
                        newValue = isPortrait ? this.pageLayout.format.dataset[abbrv + "X"] : this.pageLayout.format.dataset[abbrv + "Y"];
                        break;
                    case input.dataset.axis === 'y':
                        newValue = isPortrait ? this.pageLayout.format.dataset[abbrv + "Y"] : this.pageLayout.format.dataset[abbrv + "X"];
                        break;
                }
            }

            input.value = newValue;
            (toInches) ? input.setAttribute('step', this.units.inStep) : input.setAttribute('step', this.units.mmStep);
        });  
        
        this.updatePresets();
        this.refreshPreview();
    }
    
    isChanged(key) {
        // return this.defaults[key] !== this[key]
    }
}
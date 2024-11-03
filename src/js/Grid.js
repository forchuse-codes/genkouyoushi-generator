export class Grid {
    constructor(isClone = false) { 
        this.clone = isClone;
        this.inchToPx = 96;
        this.mmToPx = this.inchToPx / 25.4;

        this.pageLayout = this.#initPageLayout();
        this.gridDesign = this.#initGridDesign();   
        this.pdfOptions = this.#initPdfOptions();
        this.buttons    = this.#initButtons();
        // this.defaults = JSON.parse(JSON.stringify(this))

        this.preview = document.getElementById('page');
        this.grid    = document.getElementById('preview');
        this.loaded  = true;

        this.refreshPreview();
    }

    createDynamicGetters(config) {
        const structure = {};

        for (const [section, elements] of Object.entries(config)) {
            structure[section] = {};

            for (const [property, elementId] of Object.entries(elements)) {
                const element = document.getElementById(elementId);
                Object.defineProperty(structure[section], property, {
                    get() {
                        return element?.value || null;
                    }
                });
            }
        }

        return structure;
    }
    
    #initPageLayout() {
        const inchToPx = this.inchToPx;
        const pageLayout = this.createDynamicGetters({
            dimensions: {
                inchesX: 'page-width',
                inchesY: 'page-height'
            },
            margins: {
                inchesX: 'margin-x',
                inchesY: 'margin-y'
            }
        });

        ['dimensions', 'margins'].forEach((key) => {
            Object.defineProperties(pageLayout[key], {
                pxX: {
                    get() {
                        return Math.floor(parseFloat(pageLayout[key].inchesX) * inchToPx);
                    }
                },
                pxY: {
                    get() {
                        return Math.floor(parseFloat(pageLayout[key].inchesY) * inchToPx);
                    }
                }
            });
        });

        return pageLayout;
    }
    
    #initGridDesign() {
        const mmToPx = this.mmToPx;

        const designOptions = this.createDynamicGetters({
            sizes: {
                cellSizeMm: 'cell-size',
                colGap: 'col-gap',
                rowGap: 'row-gap'
            },
            colors: {
                main: 'color-main',
                sub: 'color-sub',
                subber: 'color-subber'
            }
        });

        designOptions.lineTypes = {
            fieldset: {
                sub: document.getElementById('line-type_sub'),
                subber: document.getElementById('line-type_subber')
            }            
        };

        Object.defineProperty(designOptions, 'style', {
            get() {
                return document.querySelector('input[name="grid-style"]:checked').value || 'quad';
            }
        });
        
        Object.defineProperty(designOptions.sizes, 'cellSizePx', {
            get() {
                return Math.floor(parseInt(designOptions.sizes.cellSizeMm) * mmToPx);
            }
        });

        Object.defineProperties(designOptions.lineTypes, {
            sub: {
                get() {
                    return document.querySelector('input[name="sub_line-type"]:checked').value || 'dashed';
                }
            },
            subber: {
                get() {
                    return document.querySelector('input[name="subber_line-type"]:checked').value || 'dashed';
                }
            }
        });

        return designOptions;
    }
    
    #initPdfOptions() {
        const gridOptions = this.gridDesign;
        const pdfOptions = this.createDynamicGetters({
            quality: {
                scale: 'scale',
                dpi: 'dpi'
            }
        });

        pdfOptions.filename = {
            element: document.getElementById('pdf-name')
        };

        ['size', 'gap', 'style'].forEach((option) => {
            Object.defineProperty(pdfOptions.filename, option, {
                get() {
                    return document.getElementById(option)?.checked || false
                }
            });
        });

        Object.defineProperty(pdfOptions.filename, 'name', {
            get() {
                let filename = "genkouyoushi";
                if (pdfOptions.filename.size) {
                    filename += `_${gridOptions.sizes.cellSizeMm}mm`;
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
        const buttons = document.querySelectorAll('.onclick')

        buttons.forEach(button => {
            const method = button.id

            if (typeof this[method] === 'function') {
                button.addEventListener('click', this[method].bind(this))
            }
            else {
                console.warn(`Method name ${method} does not exist in Grid class`)
            }
        });
    }

    columns() {
        const gridWidthPx = Math.floor(this.pageLayout.dimensions.pxX - 2 * this.pageLayout.margins.pxX)
        return Math.floor(gridWidthPx / (this.gridDesign.sizes.cellSizePx + parseInt(this.gridDesign.sizes.colGap)))
    }

    rows() {
        const gridHeightPx = Math.floor(this.pageLayout.dimensions.pxY - 2 * this.pageLayout.margins.pxY)
        return Math.floor(gridHeightPx / (this.gridDesign.sizes.cellSizePx + parseInt(this.gridDesign.sizes.rowGap)))
    }

    async refreshPreview() {
        this.updatePageLayout()
        this.updateGridSize()
        this.updateGridStyle()
        this.updateGridColors()
        this.updateGridLineStyle()
        this.createGridCells()
        this.updateFilename()
    }

    updatePageLayout() {
        this.preview.style.width = this.pageLayout.dimensions.pxX + "px"
        this.preview.style.height = this.pageLayout.dimensions.pxY + "px"
        this.preview.style.padding = `${this.pageLayout.margins.pxY} ${this.pageLayout.margins.pxX}`
    }

    updateGridSize() {
        const cellSizePx = this.gridDesign.sizes.cellSizePx
        this.grid.style.gridTemplateColumns = `repeat(${this.columns()}, ${cellSizePx}px)`
        this.grid.style.gridTemplateRows    = `repeat(${this.rows()}, ${cellSizePx}px)`
        this.grid.style.columnGap           = `${this.gridDesign.sizes.colGap}px`
        this.grid.style.rowGap              = `${this.gridDesign.sizes.rowGap}px`
        this.grid.style.setProperty('--main', Math.round(cellSizePx) + "px")

        if (this.gridDesign.sizes.colGap == 0) {
            this.grid.classList.add('no-gap')
        }
        else {
            this.grid.classList.remove('no-gap')
        }
    }

    updateGridStyle() {
        ['none', 'quad', 'hexa'].forEach((type) => {
            if (type === this.gridDesign.style) {
                this.grid.classList.add(type)
            }
            else {
                this.grid.classList.remove(type)
            }
        })
    }

    updateGridColors() {
        const colors = [
            'main',
            'sub',
            'subber'
        ]
          
        colors.forEach((type) => {
            this.grid.style.setProperty(
                `--${type}_c`, 
                this.gridDesign.colors[type]
            )
        })
    }

    updateGridLineStyle() {
        this.gridDesign.lineTypes.fieldset.sub.disabled = this.gridDesign.style === 'blank'
        this.gridDesign.lineTypes.fieldset.subber.disabled = this.gridDesign.style !== 'hexa'

        this.grid.style.setProperty('--sub_style', this.gridDesign.lineTypes.sub)
        this.grid.style.setProperty('--subber_style', this.gridDesign.lineTypes.subber)
    }

    createGridCells() {
        const rows  = this.rows()
        const cols  = this.columns()
        const style = this.gridDesign.style
        const cells = []

        for (let i = 0; i < (rows * cols); i++) {
            const cell = document.createElement('div')
            cell.classList.add('genkouyoushi-cell')

            if (this.gridDesign.sizes.rowGap > 0 || (i + 1) % rows === 0) {
                cell.classList.add('last-in-column')
            }

            if (this.gridDesign.sizes.colGap == 0 && cols - (i / rows) <= 1) {
                cell.classList.add('last-column')
            }

            switch(style) {
                case 'hexa':
                    const hexaLines = document.createElement('div')
                    hexaLines.classList.add('hexa-lines')
                    cell.appendChild(hexaLines)
                case 'quad':
                    const quadLines = document.createElement('div')
                    quadLines.classList.add('quad-lines')
                    cell.prepend(quadLines)
                    break;
            }

            cells.push(cell)
        }

        this.grid.replaceChildren(...cells)
    }

    updateFilename() {
        this.pdfOptions.filename.element.innerText = this.pdfOptions.filename.name;
    }

    async generatePDF() {
        await this.refreshPreview()

        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const dpi = parseInt(this.pdfOptions.quality.dpi);
        
        // Define the target PDF page dimensions and quality
        const pageWidth  = parseFloat(this.pageLayout.dimensions.inchesX) * dpi;
        const pageHeight = parseFloat(this.pageLayout.dimensions.inchesY) * dpi;

        const page       = pdfDoc.addPage([pageWidth, pageHeight]);

        // Capture the content using html2canvas
        const canvas   = await html2canvas(this.preview, { scale: this.pdfOptions.quality.scale });
        const imgData  = canvas.toDataURL('image/png');
        const pngImage = await pdfDoc.embedPng(imgData);

        // Calculate the aspect ratio of captured image
        const imgWidth  = pngImage.width;
        const imgHeight = pngImage.height;
        const aspectRatio = imgWidth / imgHeight;

        // Determine width and height that fits within the page while preserving aspect ratio
        let drawWidth = pageWidth - dpi * (2 * this.pageLayout.margins.inchesX)
        let drawHeight = drawWidth / aspectRatio
  
        // If height is too large to fit within pageHeight, adjust by height
        if (drawHeight > pageHeight - dpi * this.pageLayout.margins.inchesX) {
            drawHeight = pageHeight - dpi * this.pageLayout.margins.inchesY
            drawWidth = drawHeight * aspectRatio
        }

        // Center the image on the page
        const xOffset = (pageWidth - drawWidth) / 2;
        const yOffset = (pageHeight - drawHeight) / 2;

        // Draw the image at the calculated size
        page.drawImage(pngImage, {
            x: xOffset,
            y: yOffset,
            width: drawWidth,
            height: drawHeight,
        });
    
        // Save and download the PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.pdfOptions.filename.name;
        link.click();
    }
    
    isChanged(key) {
        // return this.defaults[key] !== this[key]
    }
    
}
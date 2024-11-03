import {Grid} from './Grid.js'

async function refreshPreview() {
    // Conversion constants
    const inchToPx = 96; // Approximate DPI for most screens
    const mmToPx = inchToPx / 25.4
    
    // Paper configuration
    const paperWidthInches = document.getElementById('page-width').value
    const paperHeightInches = document.getElementById('page-height').value
    const marginInches_X = document.getElementById('margin-x').value
    const marginInches_Y = document.getElementById('margin-y').value 
    const paddingX = (marginInches_X * inchToPx)
    const paddingY = (marginInches_Y * inchToPx)
    
    // Grid configuration
    const cellSizeMm = document.getElementById('cell-size').value
    const colGap = parseInt(document.getElementById('col-gap').value)
    const style = document.querySelector('input[name="grid-style"]:checked').value
    
    await refreshFilename(cellSizeMm, colGap, style)
    
    // Update page preview sizing
    const page = document.getElementById('page')
    page.style.width = Math.floor((paperWidthInches * inchToPx)) + "px"
    page.style.height = Math.floor((paperHeightInches * inchToPx)) + "px"
    page.style.padding = `${paddingY}px ${paddingX}px`
  
    // Calculate grid width/height in pixels
    const gridWidthPx = Math.floor((paperWidthInches - 2 * marginInches_X) * inchToPx)
    const gridHeightPx = Math.floor((paperHeightInches - 2 * marginInches_Y) * inchToPx)
    
    // Convert main cell size to pixels
    const cellSizePx = Math.floor(cellSizeMm * mmToPx)
  
    // Determine rows and columns for main grid
    const columns = Math.floor(gridWidthPx / (cellSizePx + colGap));
    const rows = Math.floor(gridHeightPx / cellSizePx)
    
    // Get the container and set its grid properties
    const grid = document.getElementById('preview')
    grid.style.gridTemplateColumns = `repeat(${columns}, ${cellSizePx}px)`
    grid.style.gridTemplateRows = `repeat(${rows}, ${cellSizePx}px)`
    grid.style.columnGap = `${colGap}px`
    grid.style.setProperty('--main', Math.round(cellSizePx) + "px")
    
    await setGridStyle(grid, style)
    await refreshGridColors(grid)
    await refreshGridLineStyle(grid, style)
    
    if (colGap == 0) {
      grid.classList.add('no-gap')
    }
    else {
      grid.classList.remove('no-gap')
    }
    
    const cells = []
    
    // Populate the main grid with cells, each containing a subgrid
    for (let i = 0; i < rows * columns; i++) {
      const cell = document.createElement('div')    
      cell.classList.add('genkouyoushi-cell')
  
      if ((i + 1) % rows === 0) {
        cell.classList.add('last-in-column')
      }
      
      if (colGap == 0 && columns - (i / rows) <= 1) {
        cell.classList.add('last-column')
      }
      
      await addGridLines(cell, style)
      
      cells.push(cell)
    }
    grid.replaceChildren(...cells)
  }
  
  async function refreshFilename(cellSize, colGap, gridStyle) {
    const size  = document.getElementById('size')
    const gap   = document.getElementById('gap')
    const style = document.getElementById('style')
    const span  = document.getElementById('pdf-name')
    let filename = "genkouyoushi"
    
    if (size.checked) {
      filename += `_${cellSize}mm`
    }
    
    if (gap.checked) {
      filename += `_${colGap}px`
    }
    
    if (style.checked) {
      filename += `_${gridStyle}`
    }
    
    span.innerText = filename + ".pdf"
  }
  
  async function refreshGridColors(grid) {
    const colors = [
      'main',
      'sub',
      'subber'
    ]
    
    colors.forEach((type) => {
      grid.style.setProperty(
        `--${type}_c`, 
        document.getElementById('color-'+type).value
      )
    })
  }
  
  async function setGridStyle(grid, style) {
    ['none', 'quad', 'hexa'].forEach((type) => {
      if (type === style) {
        grid.classList.add(type)
      }
      else {
        grid.classList.remove(type)
      }
    })
  }
  
  async function refreshGridLineStyle(grid, gridStyle) {
    const lineTypeSub = document.getElementById('line-type_sub')
    lineTypeSub.disabled = gridStyle === 'blank'
    
    const lineTypeSubber = document.getElementById('line-type_subber')
    lineTypeSubber.disabled = gridStyle !== 'hexa'
    
    const lineStyleSub = document.querySelector('input[name="sub_line-type"]:checked').value
    const lineStyleSubber = document.querySelector('input[name="subber_line-type"]:checked').value
    grid.style.setProperty('--sub_style', lineStyleSub)
    grid.style.setProperty('--subber_style', lineStyleSubber)
  }
  
  async function addGridLines(cell, style) {
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
  }
  
  async function generatePDF() {
    // Rerun refresh to make sure div content is up to date
    await refreshPreview()
  
    // Grab page layout config
    const pageWidthInches = parseFloat(document.getElementById('page-width').value)
    const pageHeightInches = parseFloat(document.getElementById('page-height').value)
    const marginInches_X = parseFloat(document.getElementById('margin-x').value)
    const marginInches_Y = parseFloat(document.getElementById('margin-y').value)
    const pdfName = document.getElementById('pdf-name').innerText
    
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
  
    // Define the target PDF page dimensions and quality
    const dpi = parseInt(document.getElementById('dpi').value)
    const quality = parseInt(document.getElementById('scale').value)
    const pageWidth = pageWidthInches * dpi
    const pageHeight = pageHeightInches * dpi
    const page = pdfDoc.addPage([pageWidth, pageHeight])
  
    // Capture the content using html2canvas
    const canvas = await html2canvas(document.getElementById('preview'), { scale: quality })
    const imgData = canvas.toDataURL('image/png')
    const pngImage = await pdfDoc.embedPng(imgData)
  
    // Calculate the aspect ratio of the captured image
    const imgWidth = pngImage.width
    const imgHeight = pngImage.height
    const aspectRatio = imgWidth / imgHeight
  
    // Determine width and height that fits within the page while preserving aspect ratio
    let drawWidth = pageWidth - dpi * (2 * marginInches_X)
    let drawHeight = drawWidth / aspectRatio
  
    // If height is too large to fit within pageHeight, adjust by height
    if (drawHeight > pageHeight - dpi * marginInches_Y) {
      drawHeight = pageHeight - dpi * marginInches_Y
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
    })
  
    // Save and download the PDF
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = pdfName
    link.click()
  }
  
  // Generate grid on page load with defaults
  (() => {
    const grid = new Grid()

    const help_buttons = document.querySelectorAll('.section-help');
    help_buttons.forEach((button) => {
        const dialog = document.getElementById(button.getAttribute('aria-controls'));
        button.addEventListener('click', () => {
            dialog.showModal();
        })

        const close_button = dialog.querySelector('.close-help');
        close_button.addEventListener('click', () => {
            close_button.closest('dialog').close();
        })
    })
  })()
# Genkouyoushi Generator

Genkouyoushi Generator is a simple application that allows for the creation of a custom genkouyoushi (Japanese kanji practice paper) grid, complete with a (mostly) live preview, which can then be saved as a PDF.

## Usage

Configuration of the genkouyoushi grid is broken up into four main sections: Page Layout, Grid Design, Vocab Mode, and PDF Options. The default units are inches because I'm a silly American, but you can toggle to millimeters if you prefer more reasonable units.

All buttons, dropdowns, radio inputs, and color sections will update the Preview automatically. For any number input (such as page width and cell size) or Vocab Mode, all you need to do after making your adjustments is click the "Refresh Preview" button at the bottom of the Configuration section to see how it looks!

Once satisfied, click "Download as PDF" to save the new genkouyoushi PDF to your computer. The download process will also automatically refresh the preview to ensure it's using the latest configuration.

## Customization Options

### Page Layout
Choose from a variety of page presets or custom page dimensions, page orientation (portrait/landscape), and margins. For margins, Top/Bottom and Left/Right pairs are each "linked" by default, but you can click on the link icon to the left of the respective labels to break them apart and adjust them individually.

Currently available page presets:
- A4 - A7
- B5
- Half-letter
- Index Card (S, M, L)
- Legal
- Letter

### Grid Design
The nitty-gritty. This determines how the genkouyoushi grid actually looks.

General terminology I use here:
- **cell:** individual square cell for one character
- **subgrid:** initial subdivision of the main cell into four squares
- **subbergrid:** second subdivision of each of the subgrid's squares into four squares

In this section, you can customize the following:
- grid cell size
- gap (in pixels) between columns and/or rows
- color of all levels of grid lines (outside border and each of the two levels of inner guidelines)
- line type of the inner guideline levels (solid, dashed, or dotted)
- grid cell style (blank/no inner lines, two guidelines/four subsquares, six guidelines/sixteen subsquares) 

### Vocab Mode
A unique option for this generator which groups columns or rows (depending on selected Direction) into groups determined by each word's character count, allowing you to have clear delineation between words while maximizing utilization of the page's available space.

Add words and adjust their individual character counts, then click "Refresh Preview" to reflect the changes. The grid will fit as many words as the page size/margins allows; if any words aren't reflected in the preview, that means they don't all fit!

Options:
- **Direction:** Left to Right (horizontal words, repetitions in a column) or Right to Left (vertical words, repetitions in a row)
- **Word Gap:** the gap (in pixels) between words
- **Characters:** the number of characters in each word (each entry is a separate word)

### PDF Options
This isn't a super necessary section; it's mostly here to potentially expand upon down the line. While I don't necessarily recommend adjusting Scale or DPI, they are options here just in case.

- **Scale:** Overall quality (from 1-10) of the saved PDF. The higher the Scale, the larger the resulting file size
- **DPI:** Dots Per Inch; a printing version of screen resolution. The higher this number, the higher the quality (and file size)
    - NOTE: Increasing DPI will also affect the PDF's final dimensions as far as printing is concerned. For example, 8.5in would be 8.5in at 72 dpi and 35.42in at 300 dpi. It can still be scaled in the print setup process if printing to a different physical page than configured in Page Layout, but the cell size may wind up being different than expected. When increasing the DPI, it's best to print it on the same size paper as set in Page Layout.
- **Filename:** adds all checked options to the downloaded PDF's filename
    - **Page Size:** preset name or width x height if custom
    - **Cell Size:** cell size in your selected unit (inches or millimeters)
    - **Gap:** column gap in px
    - **Style:** cell style (blank, quad, or hexa)

## Contributing

Issue creation and pull requests are welcome! I'm open to any and all suggestions on improving this tool.

## License

[MIT](https://choosealicense.com/licenses/mit/)
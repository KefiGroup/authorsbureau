#!/usr/bin/env python3
import sys
from docx import Document
from docx.shared import Inches, Pt

def analyze_docx(file_path):
    try:
        doc = Document(file_path)
        
        print("=" * 60)
        print("DOCX ANALYSIS REPORT")
        print("=" * 60)
        print(f"File: {file_path}\n")
        
        # Analyze sections
        print(f"Total Sections: {len(doc.sections)}")
        print()
        
        for i, section in enumerate(doc.sections, 1):
            print(f"--- Section {i} ---")
            
            # Page size
            width_inches = section.page_width / 914400  # Convert EMUs to inches
            height_inches = section.page_height / 914400
            print(f"Page Size: {width_inches:.2f}\" x {height_inches:.2f}\"")
            
            # Margins
            top_inches = section.top_margin / 914400
            bottom_inches = section.bottom_margin / 914400
            left_inches = section.left_margin / 914400
            right_inches = section.right_margin / 914400
            print(f"Margins: Top={top_inches:.2f}\", Bottom={bottom_inches:.2f}\", Left={left_inches:.2f}\", Right={right_inches:.2f}\"")
            
            # Page numbering
            if section.start_type:
                print(f"Page Break: {section.start_type}")
            
            print()
        
        # Count paragraphs and estimate pages
        total_paragraphs = len(doc.paragraphs)
        total_words = sum(len(p.text.split()) for p in doc.paragraphs)
        
        print(f"Total Paragraphs: {total_paragraphs}")
        print(f"Total Words: {total_words}")
        
        # Estimate pages (250 words per page for 6x9 format)
        estimated_pages = total_words / 250
        print(f"Estimated Pages (250 words/page): {estimated_pages:.1f}")
        
        # Check for Table of Contents
        toc_found = False
        for para in doc.paragraphs:
            if "TABLE OF CONTENTS" in para.text.upper():
                toc_found = True
                break
        
        print(f"\nTable of Contents Found: {'Yes' if toc_found else 'No'}")
        
        # Check page structure
        print("\n--- First 10 Paragraphs ---")
        for i, para in enumerate(doc.paragraphs[:10], 1):
            text = para.text.strip()
            if text:
                print(f"{i}. {text[:80]}{'...' if len(text) > 80 else ''}")
        
        print("\n" + "=" * 60)
        print("VERIFICATION")
        print("=" * 60)
        
        # Verify 6x9 format
        first_section = doc.sections[0]
        width = first_section.page_width / 914400
        height = first_section.page_height / 914400
        
        is_6x9 = abs(width - 6.0) < 0.1 and abs(height - 9.0) < 0.1
        print(f"✓ 6\" x 9\" Format: {'PASS' if is_6x9 else 'FAIL'}")
        
        # Verify margins
        left_margin = first_section.left_margin / 914400
        is_binding_margin = abs(left_margin - 0.75) < 0.1
        print(f"✓ 0.75\" Binding Margin: {'PASS' if is_binding_margin else 'FAIL'}")
        
        # Verify TOC
        print(f"✓ Table of Contents: {'PASS' if toc_found else 'FAIL'}")
        
        print()
        
    except Exception as e:
        print(f"Error analyzing DOCX: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 analyze-docx.py <file.docx>")
        sys.exit(1)
    
    analyze_docx(sys.argv[1])

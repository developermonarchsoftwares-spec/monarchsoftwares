import re
import os

def clean_main_content(html_content, page_name):
    # Find the content inside <main> and </main>
    match = re.search(r'<main>(.*?)</main>', html_content, re.DOTALL)
    if not match:
        print(f"Could not find <main> in {page_name}")
        return ""
    
    content = match.group(1)
    
    # Strip layout image wrappers (tech-visual, service-img-wrapper) with any classes or attributes
    content = re.sub(r'<div [^>]*class="[^"]*(?:tech-visual|service-img-wrapper)[^"]*"[^>]*>.*?</div>', '', content, flags=re.DOTALL)
    
    # Clean up navigation links to point to anchor tags
    content = content.replace('href="/about.html"', 'href="#about"')
    content = content.replace('href="/services.html"', 'href="#services"')
    content = content.replace('href="/it-services.html"', 'href="#it-services"')
    content = content.replace('href="/digital-marketing.html"', 'href="#marketing-services"')
    content = content.replace('href="/hr-services.html"', 'href="#hr-services"')
    content = content.replace('href="/training.html"', 'href="#training"')
    content = content.replace('href="/careers.html"', 'href="#careers"')
    content = content.replace('href="/contact.html"', 'href="#contact"')
    
    # Strip any ref query params from contact links
    content = re.sub(r'href="/contact.html\?ref=[a-zA-Z0-9_-]+"', 'href="#contact"', content)
    content = content.replace('href="/index.html"', 'href="#"')
    
    # Specific ID renames for canvasses and orbs to prevent collision and allow multi-init in main.js
    if page_name == 'services.html':
        content = content.replace('id="hero-galaxy"', 'id="services-galaxy"')
    elif page_name == 'careers.html':
        content = content.replace('id="hero-galaxy"', 'id="careers-galaxy"')
    elif page_name == 'it-services.html':
        content = content.replace('id="hero-orb"', 'id="it-orb"')
    elif page_name == 'digital-marketing.html':
        content = content.replace('id="hero-orb"', 'id="marketing-orb"')
    elif page_name == 'hr-services.html':
        content = content.replace('id="hero-orb"', 'id="hr-orb"')
        
    return content

def main():
    base_dir = "d:\\MONARCHY"
    
    # Read the base index.html
    index_path = os.path.join(base_dir, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        index_html = f.read()
        
    # Read all sub-pages
    pages = [
        ('services.html', 'services'),
        ('it-services.html', 'it-services'),
        ('digital-marketing.html', 'marketing-services'),
        ('hr-services.html', 'hr-services'),
        ('training.html', 'training'),
        ('careers.html', 'careers'),
        ('about.html', 'about'),
        ('contact.html', 'contact')
    ]
    
    page_contents = {}
    for filename, key in pages:
        path = os.path.join(base_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        cleaned = clean_main_content(content, filename)
        
        # Wrap each imported page content in a semantic container section with its master ID and stack-section class
        wrapped = f'\n        <!-- ===================== SECTION: {key.upper()} (IMPORTED FROM {filename}) ===================== -->\n'
        wrapped += f'        <section id="{key}" class="stack-section" style="position: relative; background: #000000; width: 100%; display: block; padding: 0;">\n'
        wrapped += cleaned
        wrapped += f'\n        </section>\n'
        
        page_contents[key] = wrapped
        
    # Let's locate the <main> block in index.html and reconstruct it
    main_match = re.search(r'<main>(.*?)</main>', index_html, re.DOTALL)
    if not main_match:
        print("Could not find <main> in index.html")
        return
        
    main_content = main_match.group(1)
    
    # Strip layout image wrappers from parent index.html content as well
    main_content = re.sub(r'<div [^>]*class="[^"]*(?:tech-visual|service-img-wrapper)[^"]*"[^>]*>.*?</div>', '', main_content, flags=re.DOTALL)
    
    # Split index.html main sections
    sections = re.findall(r'(<!-- ===================== (.*?) ===================== -->.*?)(?=<!-- =====================|$)', main_content, re.DOTALL)
    
    sec_dict = {}
    for full_sec, sec_title in sections:
        title_clean = sec_title.strip().upper()
        sec_dict[title_clean] = full_sec
        
    # Reconstruct main content
    new_main_content = ""
    
    # Add Home page wrapper
    new_main_content += '\n        <!-- ===================== SECTION: PAGE-HOME (HOMEPAGE SECTIONS) ===================== -->\n'
    new_main_content += '        <section id="page-home" class="stack-section" style="position: relative; background: #000000; width: 100%; display: block; padding: 0;">\n'
    new_main_content += sec_dict.get("HERO", "")
    new_main_content += sec_dict.get("THE PROBLEM WE SOLVE", "")
    new_main_content += sec_dict.get("TECH SOLUTIONS (ROBOT HAND SECTION)", "")
    new_main_content += sec_dict.get("THREE PILLARS", "")
    new_main_content += '        </section>\n'
    
    # Add merged pages
    for filename, key in pages:
        new_main_content += page_contents[key]
        
    # Add Closing page wrapper
    new_main_content += '\n        <!-- ===================== SECTION: PAGE-CLOSING (CLOSING SECTIONS) ===================== -->\n'
    new_main_content += '        <section id="page-closing" class="stack-section" style="position: relative; background: #000000; width: 100%; display: block; padding: 0;">\n'
    new_main_content += sec_dict.get("HOW WE WORK (METHODOLOGY)", "")
    new_main_content += sec_dict.get("WHY MONARCH SOFTWARES", "")
    new_main_content += sec_dict.get("TESTIMONIALS", "")
    new_main_content += sec_dict.get("FINAL CTA", "")
    new_main_content += '        </section>\n'
    
    # Update navigation inside index.html header and footer to use anchor links
    updated_index_html = index_html
    
    # Navigation Header links replacement
    updated_index_html = updated_index_html.replace('href="/index.html" class="active"', 'href="#" class="active"')
    updated_index_html = updated_index_html.replace('href="/index.html"', 'href="#"')
    updated_index_html = updated_index_html.replace('href="/services.html"', 'href="#services"')
    updated_index_html = updated_index_html.replace('href="/it-services.html"', 'href="#it-services"')
    updated_index_html = updated_index_html.replace('href="/digital-marketing.html"', 'href="#marketing-services"')
    updated_index_html = updated_index_html.replace('href="/hr-services.html"', 'href="#hr-services"')
    updated_index_html = updated_index_html.replace('href="/training.html"', 'href="#training"')
    updated_index_html = updated_index_html.replace('href="/careers.html"', 'href="#careers"')
    updated_index_html = updated_index_html.replace('href="/about.html"', 'href="#about"')
    updated_index_html = updated_index_html.replace('href="/contact.html"', 'href="#contact"')
    
    # Replace the <main> block with the new reconstructed one
    updated_index_html = re.sub(r'<main>.*?</main>', f'<main>{new_main_content}</main>', updated_index_html, flags=re.DOTALL)
    
    # Write back to index.html
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(updated_index_html)
        
    print("Merge complete! index.html updated successfully with layout images removed.")

if __name__ == "__main__":
    main()

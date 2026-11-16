"""Remove stale content-type declarations emitted by PptxGenJS 4 for absent masters.

Only declarations for nonexistent ZIP members are removed. Actual slide/master,
relationship, image, notes and editable drawing contents are preserved verbatim.
"""
import sys,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
ET.register_namespace('', 'http://schemas.openxmlformats.org/package/2006/content-types')
p=Path(sys.argv[1]);temp=p.with_suffix('.repaired.pptx')
with zipfile.ZipFile(p) as source:
    names=set(source.namelist())
    content=ET.fromstring(source.read('[Content_Types].xml'))
    removed=[]
    for item in list(content):
        part=item.get('PartName')
        if part and part.lstrip('/') not in names:
            removed.append(part);content.remove(item)
    replacement=ET.tostring(content,encoding='utf-8',xml_declaration=True)
    with zipfile.ZipFile(temp,'w',zipfile.ZIP_DEFLATED) as target:
        for info in source.infolist():
            target.writestr(info,replacement if info.filename=='[Content_Types].xml' else source.read(info.filename))
temp.replace(p)
print('Removed stale package declarations:',len(removed))

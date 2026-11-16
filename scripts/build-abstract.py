from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
root=Path(__file__).resolve().parent.parent
out=root/'pitch'/'DUNE_One_Page_Abstract.pdf'
styles={
 'title':ParagraphStyle('title',fontName='Helvetica-Bold',fontSize=38,leading=40,textColor=HexColor('#0B0F13'),spaceAfter=5),
 'tag':ParagraphStyle('tag',fontName='Helvetica',fontSize=12,leading=16,textColor=HexColor('#806239'),spaceAfter=18),
 'head':ParagraphStyle('head',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=HexColor('#0B0F13'),spaceBefore=12,spaceAfter=5),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=14,textColor=HexColor('#26323A'),spaceAfter=7),
 'foot':ParagraphStyle('foot',fontName='Helvetica',fontSize=8,leading=11,textColor=HexColor('#606B73'),spaceBefore=9),
}
flow=[]
def p(t,k='body'):flow.append(Paragraph(t,styles[k]))
p('DUNE','title');p('Desert Unified Network for Emergencies<br/>No signal. No internet. No one left unheard.','tag')
p('The communication gap','head')
p('Remote field crews need to exchange distress, location, check-ins and clinic observations beyond mobile coverage. Useful payloads are small; contacts may be brief. DUNE explores a peer-to-peer LoRa network with solar relays and vehicle-assisted store-and-forward, designed around scarce power, heat, dust, distance and shared infrastructure costs.')
p('A working, inspectable software prototype','head')
p('Each modeled device has an identity, queue, battery and contact state. A deterministic TypeScript simulator uses estimated LoRa airtime, seeded loss, duty-cycle throttling, finite buffers, packet expiry and priority aging. SOS has highest priority. A passing truck can carry a queued packet across a complete partition and forward it at the next contact.')
p('<b>Truck acceptance is not recipient delivery.</b> Destination receipt creates an independent acknowledgement packet. Only its return to the original sender confirms delivery there. A missing return path remains visible; delivery is never guaranteed.')
p('Five seeded missions show direct success, weak-link retries, a complete partition, data-mule rescue and relay battery failure. Mission Control exposes actual traces; Field Device provides a mobile queue; Resilience Lab computes synthetic outcomes; Engineering exposes energy and cost formulas. Cached assets allow browser-local simulation offline after preparation.')
p('What is different - and what is not claimed','head')
p('Existing systems such as Meshtastic already provide valuable off-grid mesh messaging. DUNE focuses on delayed-contact rescue, transparent scheduling and reproducible failure demonstrations. This is a custom simulator, not Meshtastic firmware, LoRaWAN or a complete DTN Bundle Protocol stack.')
p('<b>The website does not transmit LoRa, contact responders or provide certified emergency communication.</b> Distances and link diagnostics are synthetic. There is no hardware adapter or completed field test. A cached PWA does not turn phones into radio transceivers.')
p('A staged path to the field','head')
p('<b>1.</b> Reproduce browser packet tests. <b>2.</b> Obtain regional authorization and bench-test 2-4 actual radios. <b>3.</b> Add one instrumented solar relay and measure link, energy, thermal, dust/UV and mounting behavior. <b>4.</b> Run a monitored trained-crew pilot with provisioning, encryption, support ownership, consent for location and an independent emergency fallback.')
p('Measure delivery by priority, median/p95 delay, returned ACK rate, expiry, energy/day and cost per active user. Obtain TDRA confirmation of the exact radio profile before any UAE RF test. No universal range, approved band, emergency SLA or field benchmark is asserted.')
p('Evidence and assumptions: docs/RESEARCH.md, docs/ASSUMPTIONS.md, docs/HARDWARE_BOM.md and docs/RISK_REGISTER.md. Research date: 16 November 2026.','foot')
def page(c,d):
 c.setStrokeColor(HexColor('#D8B079'));c.setLineWidth(2);c.line(43,796,552,796)
 c.setFont('Helvetica',8);c.setFillColor(HexColor('#606B73'));c.drawString(43,25,'DUNE / HACKATHON SIMULATION MVP');c.drawRightString(552,25,'1 / 1')
SimpleDocTemplate(str(out),pagesize=A4,leftMargin=43,rightMargin=43,topMargin=55,bottomMargin=40).build(flow,onFirstPage=page,onLaterPages=page)
print(out)

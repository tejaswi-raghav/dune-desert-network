# Three-minute pitch

**0:00–0:20 · Slide 1**
DUNE stands for Desert Unified Network for Emergencies. No signal. No internet. No one left unheard. Today we demonstrate the packet logic in software. This website is not a radio network.

**0:20–0:40 · Slide 2**
Consider a field crew beyond mobile coverage. A worker needs help; a coordinator needs a location. The useful message is small. Getting it across a broken network is difficult when heat, dust, power and budget constrain every device.

**0:40–1:05 · Slide 3**
Our proposed network combines low-power LoRa radios, solar relays and vehicles that carry queued messages. Distress gets priority, with aging for routine traffic. LoRa is the modulation; peer-to-peer mesh is not LoRaWAN. Existing tools such as Meshtastic provide valuable mesh messaging. We focus on inspectable delayed-contact rescue.

**1:05–1:30 · Slide 4**
An SOS starts in a local queue. A truck accepts it, carries it across a partition, and forwards it to base. Truck acceptance is not delivery. Base receipt is not sender confirmation. An independent acknowledgement must return through available contacts. TTL, retry budgets and failed return paths remain visible.

**1:30–2:00 · Slide 5 · LIVE DEMO**
Select Total partition. Advance thirty seconds: the message remains undelivered. Select Data mule rescue. Advance the replay: watch queued, carried, delivered, then acknowledged after the truck returns. Inspect the actual event trace. These states come from the simulator, not from decorative packet animations.

**2:00–2:30 · Slide 6**
Start with two to four authorized radios. Then test one solar relay, then a monitored crew pilot. Our energy and cost panels expose every assumption. They are planning estimates, not measurements. Safe charging temperatures, dust and UV protection, local spectrum approval and an independent emergency fallback are prerequisites.

**2:30–3:00 · Slide 7**
DUNE is useful when a permanent connection is unavailable but another contact is plausible. We show successful delivery and failure with the same honesty. Measure delivery by priority, p95 delay, returned acknowledgements and energy per day. Connectivity should not end where infrastructure does.

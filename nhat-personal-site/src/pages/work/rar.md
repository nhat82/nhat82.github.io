---
layout: ../../layouts/Work.astro
title: Roots and Routes
description:
published: 2025
logo: /images/tree.png
year: 2025
---

## Overview
AI/AR Solutions for plant identification @ UMD.
![Example lincense (generated)](/images/group.png)

## Specs
Our client, Dr.Neel from the Plant Sciences department, wants a web-based AI model to identify +1000 plant species on campus. This tool would be used in research field trips, classrooms, and leisure. 

Budget: None. GPU resource: None. Data: Not enough & unlabeled. Previous research project teams have tried but always fell short due to long data labeling/cleaning stage. We also had access to a database of plants' GPS locations and their info (species, subspecies, height, age, etc). 

## Working on the project

I organized client meetings to understand her needs and the problems she's trying to solve more. The team started experiementing with pre-trained models and I made the website for us to test. 

I soon realized that pre-trained models either is too expensive or too low quality. We wanted to get at least 70% accuracy rate. We decided to use the GPS location data to narrow down the prediction results by filtering out plants that aren't near the user's current location. 

I found out about AR (Augmented Reality) technology and its potential in solving our painpoints. 
- Trees change throughout the year. AI models can't identify a plant species based on dead small branches. 
- Training takes too long. 

I researched on my own about the AR tech and lightweight web-based libraries. I coded and tested multiple versions for 2 weeks before showing it to the team. 

<video width="320" height="240" controls>
  <source src="/video/pokemon.mp4" type="video/mp4">
</video>

Convincing a team to change to a different direction where no one is an expert at was risky. But I believed it was the right thing to do and worth trying. I had built trust with the team with another project before where I handled almost all of the work and got it done well under a very short amount of time so they were willing to listen. 

We did risk analysis, I did a lot of tool testing and research and found that only AR.js was the best and only fit for iOS, Andriod, web-based, free AR.

But no one has worked with AR.js or AR before, we can't change course completely 180. So I proposed that AI is still the main focus. AR is the backup plan. 

We split into 2 teams. AI and AR. I was leading the AR team of 3. 

I read the documentation as I was developing and was aware that there were limitations such as sensor miscalibration. The documentation did a good job at hiding the low location accuracy for locar.js. I didn’t dig deep enough on its issues in the beginning (we didn’t know about these issues until we experienced it ourselves later and were stuck for a long time trying out different versions). There was also little to no documentation to the newest versions of AR.js, it was hard to do quality tests, intergration tests. I logged the results to an excel sheet everytime we tested on live plants outside just to see what was working. 
![Example lincense (generated)](/images/track.png)

The idea is there but the tech isn't ready. 80% of phones on our campus is iPhone; most iPhone users use safari, which doesn't support AR - for the few that use Chrome, the direction of the phone heading would drift, where it would face the wrong north, making it harder for AR to work. 

At this point, our biggest painpoints were:
1. AR markers drift and we can't fix either the hardware or software. 
    - I tried different techiques of anchoring, tweaking gyro sensor for each phone (different hardware different problems, I couldn't tweak and test for them all). I tried rewriting the code and fix it (doesn't work and didn't know the math well enough). I asked my computer vision professor for help and guide (he said surface detection and anchoring for videos for such a wide range of phones is very hard and would take a lot of computing power). I looked into 8th Wall / Niantics' products but they would require a lot of location labeling, manual scanning and a lot of money. 
![alt text](/images/mck1.png)

2. AI training was slow with training, we didn't know if we can make it in time for CDR (Critical Design Review). 

3. Hybrid plant species that we have 0 images of. 10% of the plants on campus are hybrids.

4. Team was discouraged, everyone had senioritis. Lack of communication between teams despite my best effort to encourage it and let everyone know about our progress. I had set up meetings to coordinate with everyone, using Jira to layout stories. But everyone was either moving such a fast pace or that the specs was changing or that they just didn't remember to update things, we didn't have a clear line of vision in terms of progress from both teams. 

Not settling these issues upfront cost us roughly 4 weeks of dev time of 2 people (me and my teammate) chasing AR fixes and researching bandage fixes. This also led to lower reliability of the backup to the client, and diverted our focus from other improvements like refining AI model architecture, preprocessing images.

## Result
1. AR
Drifting was still a huge issue when wifi/hotspot is weak, user moves/spins around a lot, is surrounded by tall buildings. Usability is 80%. 

2. AI
89% accuracy rate for 60% of the plants on the UMD campus. But website would crash/is very slow if more than 20 people log on because the model is huge and our server is at our memory limit. 

![dots](/images/mck4.png)

## What would have helped

1. Feasibility Prototyping: We could have built quick projects to test risky technical assumptions like GPS accuracy and AR marker anchoring before committing to full dev. We would have noticed those limitations earlier. 

2. Proof of Concept Demo for user experience viability: One of the pieces of feedback we got from students was that within a cluster of plants and blue dots overlaying them, they don’t know which dot-plant pair they were looking at. If we had tested with more users with a PoC in the earlier stages, we would have changed the approach or added different colors for different species of plants. 
![dots](/images/mck2.png)

3. (Not related to AR) Early stress testing: We should have simulated high traffic scenarios early by having multiple testers use the AI model on the VM, monitor VM memory and CPU usage during those tests because it would have exposed the VM’s memory cap muc earlier and sing to us that we could scale down or have additional VM resources. 

4. Do Functional Point (FP) analysis for AR more frequently. SLAM/VPS requires (campus-wide area scanning and mapping, custom scene anchoring, device calibration, server hosting) is too much. Time and engineering cost would clearly overshoot our delivery window. 

5. Regular standups or weekend async check-ins. More centralized, shared visuallized task boards - ticket ownership transparency. 


## What I learned
1. Software engineering is a practice of communication. 
2. Giving and receiving feedback that's constructive and effective is a must-have skill. Earning trust with your team isn't just about getting work done. It's also about being easy/pleasant to work with. 
3. Change is inevitable. If something isn't working out, re-evaluate to see if this is still serving the main goal. If not, change, and don't get tunnel vision into solving something that doesn't add technical or business value. 
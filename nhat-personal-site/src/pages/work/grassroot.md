---
layout: ../../layouts/Work.astro
title: Grassroots Groceries
description:
published: 12/28/2023
year: 2022-2023
logo: /images/food.png
---

## Overview
Non-profit that delivers food to neighborhoods. I was their software engineer intern for summer 2023. 

## What I did
I wrote scripts that automate 400+ delivery-driver pairings with zone restrictions and slot matching using JavaScript in Airtable.  

It was my first time working with Airtable. It's mainly used for projact management and content calendars but we needed to treat it as a normal ACID database. 

The Automation fuctionality was still in its beta phase. I was dealing with race conditions when updating assignments to different locations where either the status of the driver or the location wasn't being updated correctly and there wasn't a way to lock thread. So instead of using the automation feature, I made queues for drivers and locations and as soon as a table is full or a driver is assigned, I pop them off the queue. This was also easier for the non-tech founder to understand and modify. 

The scripts were also had run time limits too so I had to remove unimportant columns, sorting, and refactor previous scripts. 

## What I learned
1. Learning something new 
- Read the documentation, and at least try to understand the gist of it. 
- Experiment fast to learn fast. Doing something is always better than reading about it for hours. 
- If stuck for too long, ask. How long? Depends but always make sure to research yourself first. 

2. Be creative when limited resources and time. Keep it simple first. 
3. How to explain technical terms simply to non-tech people. Use real life examples and similes. 

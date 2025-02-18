# story embeds

this simple webapp makes it easy to create a few simple social media embeds on
ao3. i might add to it over time, but it's not meant to be a big project. feel
free to use it as you will.

## styles

- twitter (basically x, but with names reverted)
- instagram dms
- iphone (non-group) messages (~ios 16)

other dm types (google messages; twitter dms) or x would be easy to add. group
messages would be harder. other socials probably harder still.

## notes

currently the format used is json, which is terrible. i thought about making a
version that uses a better format like toml or writing a custom parser, but i
wasn't really planning on spending a ton of time on this. maybe if people are
into it i can.

## bugs

sure probably. let me know if you find anything.

## development

to develop, just run `npm install` in the project folder. it's a `vite` project,
so from there you can start the app locally with `npm run dev`.

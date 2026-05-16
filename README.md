<div align="center">

# [ManaCounter](https://manacounter.bhm.gg)

Track mana in Magic: The Gathering for those thirty-minute turns

</div>


## Overview

Built in ~1 hour ~~because apparently I have to do everything myself~~ because there was a distinct lack of results on Google for mana counters that didn't demand you download an app.

### Goals

Track mana, but without an app.

### Features

- [X] Track Mana
- [ ] Shift+Click to increment by 5/10 maybe?
- [ ] Right-Click to decrement
- [ ] Installable PWA

### Software Stack / Technologies Used

- Language: HTML + JavaScript + CSS
- Framework: Alpine.js, Nginx

## Quickstart

```sh
docker buildx build -t manacounter:master .
docker run manacounter:master	# tries to bind to port 80
```


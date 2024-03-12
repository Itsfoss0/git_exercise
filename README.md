## Bloglist API

### About

This is an API where users can store their favourite blogs. Other users can visit them and upvote or downvote, stackoverflow style.

### Usage

After cloning this repository and navigating to `bloglist`, follow the steps listed below for local development

First, you'll need to source the `script.sh` file, or you could export the variables (_MONGO_URI_ and _PORT_) on your own in your shell, however, using the script is much faster.

```shell
[user@host]─[/home/user/Desktop/bloglist]
└──╼ # source script.sh

[user@host]─[/home/user/Desktop/bloglist]
└──╼ # npm install

[user@host]─[/home/user/Desktop/bloglist]
└──╼ # npm start
```

### Boostrapping

There are custom git hooks in the `hooks` dir that you can setup to increase your productivity and ensure quality.
The `pre-commit` hook runs on every commit to run tests and check the code against linting guidelines. The `commit-msg` hook runs to check the commit message against the standards.

To use the, create a sym link for the `hooks` dir to `.git/hooks/`

export const getFacebookUrl = (link: string) => {
    if (link.match(/.*(facebook|fb).*\//g)) {
        return link;
    }
    return `https://www.facebook.com` + link;
};

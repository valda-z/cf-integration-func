const { app } = require('@azure/functions');

app.http('AlzaMailParse', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const data = await request.json();
        const body = data.body;

        // extract all <a href="..."> any text or <span>..</span> </a> links
        const links = body.match(/<a href="(.*?)">.*?<\/a>/g).map(link => {
            const href = link.match(/<a href="(.*?)".*>/)[1];
            // only return the href if contains "https://www.alza.cz/Apps/pdfdoc.asp" or "ISDOCinvoicedownload"
            if (href.includes("https://www.alza.cz/Apps/pdfdoc.asp") || href.includes("ISDOCinvoicedownload")){
                return href;
            }            
        }).filter(link => link !== undefined);
        // map array to two objects for pdf and isdocs
        const docs = {
            pdf: links.filter(link => link.includes("https://www.alza.cz/Apps/pdfdoc.asp")),
            isdoc: links.filter(link => link.includes("ISDOCinvoicedownload"))
        };
        // application/json
        return {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "docs": docs,
            })
        };
    }
});

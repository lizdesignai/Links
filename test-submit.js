const submitHandler = require('./api/submit.js');

async function test() {
    const req = {
        method: 'POST',
        body: {
            "_subject": "Novo Briefing (Brand Discovery) Recebido!",
            "Nome_Cliente": "Test",
            "Email": "test@test.com"
        }
    };

    const res = {
        status: function(s) {
            console.log("Status:", s);
            return this;
        },
        json: function(j) {
            console.log("JSON:", j);
            return this;
        }
    };

    try {
        await submitHandler(req, res);
        console.log("Finished successfully");
    } catch (e) {
        console.error("Test caught error:", e);
    }
}

test();

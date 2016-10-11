const expect = require('chai').expect;
const format = require('util').format;
const fs = require('fs');
const q = require('q');
const simple_config = require('..');

describe('Config', () => {
    it('loads json and gets values', () => {
        const filename = format(
            '/tmp/.smplcnf.test.config.%d.json',
            (new Date()).getTime()
        );

        const conf = simple_config();

        return q.nfcall(
            fs.writeFile,
            filename,
            '{"test":{"value":"exists!"}}'
        )
        .then(() => conf('test.value', 'dont exists'))
        .then(value => {
            expect(value)
            .to.equal('dont exists');
        })
        .then(() => {
            conf.load(filename);

            return conf('test.value', 'dont exists');
        })
        .then(value => {
            expect(value)
            .to.not.equal('dont exists');
        })
        .finally(() => q.nfcall(fs.unlink, filename))
    });

    it('loads multiple files and gets overwritten value', () => {
        const filename_1 = format(
            '/tmp/.brewtils.test.config.%d.1.json',
            (new Date()).getTime()
        );

        const filename_2 = format(
            '/tmp/.brewtils.test.config.%d.2.json',
            (new Date()).getTime()
        );

        const conf = simple_config();

        return q.all([
            q.nfcall(
                fs.writeFile,
                filename_1,
                '{"test":{"value1":"funk","value2":"hello"}}'
            ),
            q.nfcall(
                fs.writeFile,
                filename_2,
                '{"test":{"value2":"overwritten!","value3":"bye"}}'
            )
        ])
        .then(() => conf('test.value', 'dont exists'))
        .then(value => {
            expect(value)
            .to.equal('dont exists');
        })
        .then(() => {
            conf.load(filename_1).load(filename_2);

            return q.all([
                conf('test.value1'),
                conf('test.value2'),
                conf('test.value3')
            ]);
        })
        .spread((value1, value2, value3) => {
            expect(value1).to.equal('funk');
            expect(value2).to.equal('overwritten!');
            expect(value3).to.equal('bye');
        })
        .finally(() => {
            return q.all([
                q.nfcall(fs.unlink, filename_1),
                q.nfcall(fs.unlink, filename_2)
            ]);
        });
    });

    it('sets values from emptyness', () => {
        const conf = simple_config();

        return conf.set({key: 'value'})('key')
        .then(key => {
            expect(key).to.equal('value');
        });
    });

    it('loads and sets', () => {
        const filename = format(
            '/tmp/.brewtils.test.config.%d.json',
            (new Date()).getTime()
        );

        const conf = simple_config();

        return q.nfcall(
            fs.writeFile,
            filename,
            '{"test":{"value":"is there"}}'
        )
        .then(() => conf.load(filename).set({key: 'value'}))
        .then(() => conf('key'))
        .then(key => {
            expect(key).to.equal('value');

            return conf('test.value');
        })
        .then(value => {
            expect(value).to.equal('is there');
        })
        .finally(() => q.nfcall(fs.unlink, filename));
    });

    it('sets and clears', () => {
        const conf = simple_config();

        return conf.set({key: 'value'}).clear()('key', 'not there')
        .then(value => {
            expect(value).to.equal('not there');
        });
    });
});

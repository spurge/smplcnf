const conf = require('../');
const deep_freeze = require('deep-freeze');
const expect = require('chai').expect;
const fs = require('fs');
const q = require('q');
const format = require('util').format;

describe('Config', () => {
    it('shall load and get', done => {
        const filename = format(
            '/tmp/.smplcnf.test.config.%d.json',
            (new Date()).getTime()
        );

        deep_freeze(conf);

        conf.clear();

        q.nfcall(
            fs.writeFile,
            filename,
            '{"test":{"value":"exists!"}}'
        )
        .then(() => {
            return conf('test.value', 'dont exists');
        })
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
        .finally(() => {
            return q.nfcall(fs.unlink, filename);
        })
        .done(done);
    });

    it('shall clear, load and get', done => {
        const filename_1 = format(
            '/tmp/.brewtils.test.config.%d.1.json',
            (new Date()).getTime()
        );

        const filename_2 = format(
            '/tmp/.brewtils.test.config.%d.2.json',
            (new Date()).getTime()
        );

        deep_freeze(conf);

        conf.clear();

        q.all([
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
        .then(() => {
            return conf('test.value', 'dont exists');
        })
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
        })
        .done(done);
    });

    it('shall set from emptyness', done => {
        deep_freeze(conf);

        conf.clear();
        conf.set({key: 'value'});

        conf('key')
        .then(key => {
            expect(key).to.equal('value');
        })
        .done(done);
    });

    it('shall load and set', done => {
        deep_freeze(conf);

        const filename = format(
            '/tmp/.brewtils.test.config.%d.json',
            (new Date()).getTime()
        );

        deep_freeze(conf);

        conf.clear();

        q.nfcall(
            fs.writeFile,
            filename,
            '{"test":{"value":"is there"}}'
        )
        .then(() => {
            conf.load(filename).set({key: 'value'});
        })
        .then(() => conf('key'))
        .then(key => {
            expect(key).to.equal('value');

            return conf('test.value');
        })
        .then(value => {
            expect(value).to.equal('is there');
        })
        .done(done);
    });
});

suite('two types', function () {
  this.timeout(15000);

  suite('two types test', function () {

    test('signIn hommer', function (done) {
      this.timeout(15000);
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          done();
          assert.ok(false, err.message);
        })
        .done(function () {
          assert.equal(
            hoodie.account.username,
            'hommer',
            'should be logged in after signup'
          );
          done();
        });
    });

    test('hommer showd subscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          done();
          assert.ok(true, 'follow with sucess');
        });
    });

    test('hommer not should subscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done();
          assert.ok((err.message ==='You already subscribed.'), err.message);
        })
        .then(function () {
          done();
          assert.ok(false, 'should throw error [You already subscribed.] ');
        });
    });

    test('hommer showd subscribe marge posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Margie' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Lisa' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd bidirectional Krust posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.bidirectional(_.find(window.fixtures.users, { username: 'Krust' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd bidirectional Lenny posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.bidirectional(_.find(window.fixtures.users, { username: 'Lenny' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

   test('hommer should show 6 subscribers', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribers()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscribers.length === 6) , 'subscribers ' + task.pubsub.subscribers.length + ' with sucess');
          done();
        });
    });

   test('hommer should show 10 subscriptions', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscriptions()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscriptions.length === 10) , 'subscriptions ' + task.pubsub.subscriptions.length + ' with sucess');
          done();
        });
    });

   test('hommer should show 5 subscriptions by type', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscriptionsByType(['post', 'chat'])
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscriptions.length === 5) , 'subscriptions ' + task.pubsub.subscriptions.length + ' with sucess');
          done();
        });
    });

    test('hommer showd unsubscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.unsubscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd unbidirectional Lenny posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.unbidirectional(_.find(window.fixtures.users, { username: 'Lenny' }).hoodieId, ['post', 'chat'])
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa chat and only lisa must recive', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Cat' }).hoodieId, ['post', 'chat'], true)
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa chat and only lisa must recive', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Dog' }).hoodieId, ['post', 'chat'], true)
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('Dog showd subscribe hommer', function (done) {
      signinUser('dog', 123, function () {
        hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, ['post', 'chat'], true)
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          })
          .then(function () {
            assert.ok(true, 'follow with sucess');
            done();
          });
      })
    })

    test('Lisa showd subscribe hommer', function (done) {
      signinUser('lisa', 123, function () {
        hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, ['post', 'chat'], true)
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          })
          .then(function () {
            assert.ok(true, 'follow with sucess');
            done();
          });
      })
    })


    test('hommer showd create a post document', function (done) {
      this.timeout(15000);
      signinUser('hommer', 123, function () {
        hoodie.store.add('post', { text: 'my post doh!',  userId: _.find(window.fixtures.users, { username: 'Hommer' }).hoodieId } )
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          })
          .then(function () {
            assert.ok(true, 'follow with sucess');
            done();
          });
      });
    });

    test('hommer showd create a post document exclusive', function (done) {
      this.timeout(15000);
      hoodie.store.add('post', { text: 'au au au',  userId: _.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, exclusive: [ _.find(window.fixtures.users, { username: 'Dog' }).hoodieId ] } )
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('Lisa showd have the post from hommer', function (done) {
      signinUser('lisa', 123, function () {
        hoodie.store.findAll('post')
          .then(function (docs) {
            assert.ok(docs.length === 2, 'has a post from hommer');
            done();
          })
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          });
      })
    })

    test('Dog showd have the posts from hommer include the exclusive one', function (done) {
      signinUser('dog', 123, function () {
        hoodie.store.findAll('post')
          .then(function (docs) {
            assert.ok(docs.length === 2, 'has 2 posts from hommer');
            done();
          })
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          });
      })
    })

  });

});

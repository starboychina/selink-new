var env = process.env.NODE_ENV || 'development',
    config = require('../../config/global')[env],
    path = require('path'),
    templatesDir = path.resolve(__dirname, 'templates'),
    emailTemplates = require('email-templates'),
    nodemailer = require('nodemailer');

// Setup mail transport facility
var transport = nodemailer.createTransport(config.mail);

exports.accountActive = function(recipient) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            // send account active email
            template('account-active', recipient, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: 'SELinkへようこそ！',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.resetPassword = function(recipient) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            // send account active email
            template('password-retrieve', recipient, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: 'SELinkパースワード更新案内',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.friendInvitation = function(recipient, sender) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender
            };

            template('friend-invitation', locals, function(err, html, text) {
                if (err) console.log(err);
                else {

                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー 友達要請',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send friend-invitation email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.friendApprove = function(recipient, sender) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender
            };

            // send account active email
            template('friend-approve', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー 友達要請を承認しました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send friend-approve email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.groupInvitation = function(recipients, sender, group) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, group) {

                this.locals = {
                    recipient: recipient,
                    sender: sender,
                    group: group
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: sender.firstName + ' ' + sender.lastName + ' ー グループ招待',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log('send group-invitation email to: ' + recipient.email);
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('group-invitation', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], group);
                    render.batch(batch);
                }
            });
        }
    });
};

exports.groupJoined = function(recipient, sender, group) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                group: group
            };

            // send account active email
            template('group-join', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー グループ「' + group.name + '」参加しました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send group-joined email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.groupApplied = function(recipient, sender, group) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                group: group
            };

            // send account active email
            template('group-applied', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー グループ参加申請',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send group-applied email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.groupApproved = function(recipient, sender, group) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                group: group
            };

            // send account active email
            template('group-approved', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー グループ参加承認',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send group-approved email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.newPost = function(recipients, sender, post, group) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, sender, post, group) {

                this.locals = {
                    recipient: recipient,
                    sender: sender,
                    post: post,
                    group: group
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: sender.firstName + ' ' + sender.lastName + ' ー 新しい記事',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log('send new-post email to: ' + recipient.email);
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('new-post', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], sender, post, group);
                    render.batch(batch);
                }
            });
        }
    });
};

exports.postLiked = function(recipient, sender, post) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                post: post
            };

            template('post-liked', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー あなたの記事を「いいね！」しました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send post-liked email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.postBookmarked = function(recipient, sender, post) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                post: post
            };

            template('post-bookmarked', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー あなたの記事にブックマックを付けました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send post-bookmarked email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.postCommented = function(recipient, sender, comment, post) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                comment: comment,
                post: post
            };

            template('post-commented', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー あなたの記事をコメントしました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send post-commented email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.commentReplied = function(recipient, sender, comment, reply, post) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                comment: comment,
                reply: reply,
                post: post
            };

            template('comment-replied', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー あなたのコメントを返信しました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send comment-replied email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.commentLiked = function(recipient, sender, comment, post) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var locals = {
                sender: sender,
                comment: comment,
                post: post
            };

            template('comment-liked', locals, function(err, html, text) {
                if (err) console.log(err);
                else {
                    transport.sendMail({
                        from: 'SELink <noreply@selink.jp>',
                        to: recipient.email,
                        subject: sender.firstName + ' ' + sender.lastName + ' ー あなたのコメントを「いいね！」しました',
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) console.log(err);
                        else {
                            console.log('send comment-liked email to: ' + recipient.email);
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};

exports.newJob = function(recipients, job) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, job) {

                this.locals = {
                    recipient: recipient,
                    job: job
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: '仕事情報',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('new-job', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], job);
                    render.batch(batch);
                }
            });
        }
    });
};

exports.newMessage = function(recipients, message) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, message) {

                this.locals = {
                    recipient: recipient,
                    message: message
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: '新しいメッセージ',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('new-message', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], message);
                    render.batch(batch);
                }
            });
        }
    });
};

exports.newEvent = function(recipients, event) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, event) {

                this.locals = {
                    recipient: recipient,
                    event: event
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: 'イベント開催',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('new-event', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], event);
                    render.batch(batch);
                }
            });
        }
    });
};


exports.newAnnouncement = function(recipients, announcement) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, announcement) {

                this.locals = {
                    recipient: recipient,
                    announcement: announcement
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: 'SELinkからのお知らせ',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('new-announcement', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], announcement);
                    render.batch(batch);
                }
            });
        }
    });
};

exports.newUser = function(recipients, user) {

    emailTemplates(templatesDir, function(err, template) {

        if (err) console.log(err);
        else {

            var Render = function(recipient, user) {

                this.locals = {
                    recipient: recipient,
                    user: user
                };

                this.send = function(err, html, text) {
                    if (err) console.log(err);
                    else {
                        transport.sendMail({
                            from: 'SELink <noreply@selink.jp>',
                            to: recipient.email,
                            subject: '新しいユーザが登録しました',
                            html: html,
                            text: text
                        }, function(err, responseStatus) {
                            if (err) console.log(err);
                            else {
                                console.log(responseStatus.message);
                            }
                        });
                    }
                };

                this.batch = function(batch) {
                    batch(this.locals, templatesDir, this.send);
                };
            };

            // Load the template and send the emails
            template('new-user', true, function(err, batch) {
                for(var recipient in recipients) {
                    var render = new Render(recipients[recipient], user);
                    render.batch(batch);
                }
            });
        }
    });
};
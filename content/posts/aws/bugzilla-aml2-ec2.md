---
title: "Bugzilla on Amazon Linux 2 EC2 Instance"
date: 2020-07-18T11:38:53-04:00
categories: ["aws"]
tags: ["aws", "bugzilla", "ec2", "aml", "aml2"]
draft: true
---

## Introduction
It's crazy what you can find for deploying services in aws.  It's also crazy 
what you CANNOT find.  This guide should hopefully help you deploy Bugzilla 
4.2.4 on an Amazon Linux 2 EC2 instance in AWS.  

I'm deploying Bugzilla version 4.2.4 because that is what my company currently 
uses in production.  We have the drive to upgrade to 5.0, but we are utilizing 
the Testopia plugin and it hasn't reached a golden release for Bugzilla 5.0 
as of writing this.  This procedure should work just as well to deploy 
Bugzilla 5.0, if that is what you're going for.

## Step 1 - Create Your Instance
Ideally, you'd setup an RDS instance to manage the database but we're not 
doing anything fancy with this deployment.  I suggest a 't2.small' instance 
to start with, as you can always upgrade your CPU and memory specs later 
if you find the performance doesn't work for you.  The only other change 
I've made is attaching a 120GB EBS volume as opposed to the default 8GB.

## Step 2 - Installing Perl and Other Build Dependencies
Login to your instance and make sure the system is updated:

`sudo yum update -y`

### Verify Perl, CPAN, etc. are updated:
`sudo yum install perl perl-CPAN perl-Locale-Codes perl-CGI perl-DBD-MySQL -y`

### Verify your perl installation:
`perl -v`

Should get something out that looks like this:

```
This is perl 5, version 16, subversion 3 (v5.16.3) built for x86_64-linux-thread-multi
(with 39 registered patches, see perl -V for more detail)

Copyright 1987-2012, Larry Wall

Perl may be copied only under the terms of either the Artistic License or the
GNU General Public License, which may be found in the Perl 5 source kit.

Complete documentation for Perl, including FAQ lists, should be found on
this system using "man perl" or "perldoc perl".  If you have access to the
Internet, point your browser at http://www.perl.org/, the Perl Home Page.
```

### Install build and other dependencies:
`sudo yum install gcc gd gd-devel rst2pdf graphviz patchutils -y`

## Apache Installation + Configuration
### Install Apache: 
`sudo yum install httpd httpd-devel -y`

### Comment out everything in the conf:
`sudo sed -i 's/^/#&/g' /etc/httpd/conf.d/welcome.conf`

### Enable and Start Apache service:
`sudo systemctl enable --now httpd.service`

## MariaDB Installation + Configuration
### Install MariaDB
`sudo yum install mariadb mariadb-server mariadb-devel -y`

### Enable and Start MariaDB Service:
`sudo systemctl enable --now mariadb.service`

### Secure MariaDB:
`sudo /usr/bin/mysql_secure_installation`

Here's the settings I selected:
```
    Enter current password for root (enter for none): ENTER
    Set root password? [Y/n]: ENTER
    New password: <NEW_ROOT_PASSWORD>
    Re-enter new password: <NEW_ROOT_PASSWORD>
    Remove anonymous users? [Y/n]: ENTER
    Disallow root login remotely? [Y/n]: ENTER
    Remove test database and access to it? [Y/n]: ENTER
    Reload privilege tables now? [Y/n]: ENTER
```

Log into MySQL as the root user:

`mysql -u root -p`

Create a Bugzilla user and database (be sure to change **\<PASSWORD\>**):
```
CREATE DATABASE bugzilla;
CREATE USER 'bugzilla'@'localhost' IDENTIFIED BY '<PASSWORD>';
GRANT ALL PRIVILEGES ON bugzilla.* TO 'bugzilla'@'localhost' 
  IDENTIFIED BY '<PASSWORD>' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

### Modify MariaDB's Config:
`sudo vi /etc/my.cnf.d/server.cnf`

Under the **[mysqld]** line, add the following:
```
max_allowed_packet=16M
ft_min_word_len=2
```

`:wq` to save exit VI

Restart MariaDB to update the config:

`sudo systemctl restart mariadb.service`

## Install Bugzilla
### Pull archive from the official Bugzilla server:
`wget -O /tmp/bugzilla-4.2.4.tar.gz https://ftp.mozilla.org/pub/mozilla.org/webtools/bugzilla-4.2.4.tar.gz`

### Extract archive then delete it:
`sudo tar -C /opt -zxvf /tmp/bugzilla-4.2.4.tar.gz`

### Delete archive:
`rm /tmp//tmp/bugzilla-4.2.4.tar.gz`

### Link directory for Apache:
`sudo ln -s /opt/bugzilla-4.2.4 /var/www/html/bugzilla`

### Run checksetup.pl
`cd /var/www/html/bugzilla`

`sudo /usr/bin/perl checksetup.pl`

The output will show you a large list of modules that are required:
```
COMMANDS TO INSTALL REQUIRED MODULES (You *must* run all these commands
and then re-run checksetup.pl):

    /usr/bin/perl install-module.pl Date::Format
    /usr/bin/perl install-module.pl DateTime
    /usr/bin/perl install-module.pl DateTime::TimeZone
    /usr/bin/perl install-module.pl Template
    /usr/bin/perl install-module.pl Email::Send
    /usr/bin/perl install-module.pl Email::MIME
    /usr/bin/perl install-module.pl URI
    /usr/bin/perl install-module.pl List::MoreUtils
    /usr/bin/perl install-module.pl Math::Random::ISAAC
```
Unfortunately, I haven't had much success getting the 'install-module.pl' 
script to run properly.  I ended up utilizing CPAN directly to install 
the modules.  When you install the first one, you'll be asked some questions 
to setup how CPAN operates.  Just hit `ENTER` to select the defaults.

I had to run the following in my environment:
```
sudo perl -MCPAN -e 'install "Date::Format"'
sudo perl -MCPAN -e 'install "DateTime"'
sudo perl -MCPAN -e 'install "Template"'
sudo perl -MCPAN -e 'install "Email::Send"'
sudo perl -MCPAN -e 'install "Email::MIME"'
sudo perl -MCPAN -e 'install "URI"'
sudo perl -MCPAN -e 'install "List::MoreUtils"'
sudo perl -MCPAN -e 'install "Math::Random::ISACC"'
```


---
title: "AWS-CLI Cognito Remove All Users"
date: 2021-06-24T10:53:42-04:00
categories: ["general"]
tags: ["aws", "aws-cli", "cognito"]
draft: false
---
I've been working on a lambda service that will place users into groups based on their IdP (identity provider).  I've recently had a feature request to place users into specific groups within the UP (user pool) based on a list of groups within an attribute received from the IdP.  

We utilize a UP for our testing/dev environments and to test this new feature I wanted to remove all the current users within the UP.  Using the AWS Cognito Console is rather cumbersome, especially if you're wanting to remove multiple users.  

Using the AWS-CLI, you can easily remove a single user if you have the UP ID and the username of the account you want to remove.  I need to remove about 15 accounts though. Here's what I came up with...

```bash
USERPOOLID=__USERPOOLID__; \
for u in $(aws --profile dev cognito-idp list-users --user-pool $USERPOOLID | jq -r '.Users[].Username'); \
do aws --profile dev cognito-idp admin-delete-user --user-pool-id $USERPOOLID --username $u; \
done
```

**\_\_USERPOOLID\_\_** - Change to the ID for the UP you want to remove the users from.

**--profile prod** - Change this to match the AWS profile for the environment you're targeting. 

jq is a lightweight and flexible command-line JSON processor.  You'll need to [get it](https://stedolan.github.io/jq/) for this solution to work.
TODO
https://alexb72.medium.com/how-to-send-emails-using-a-nodemailer-gmail-and-oauth2-fe19d66451f9

# Context
I built this to spam my previous scumbag landlord who ignored all inquiries about returning my security deposit.
I live in NYC where landlords are legally required to furnish the security deposit and any itemized deductions 
within 14 days of the tenant moving out. After this period, the landlord forefeits any rights to any portion of 
the deposit. It has been over a month in my case.

I waited patiently for 1 month before following up with them. Multiple emails fell on deaf ears. Because of poor experiences in the past, I decided to spam them until they responded. I decided to use the Fibonacci number of the day to send that number of emails to a strategically selected set of email recipients. For example, I sent 1 email to 6 recipients on the first and second days. 3 emails to 6 recipients on the fourth day. etc, etc.

This is obviously unsustainable, and a waste of my time. So I built this program to automate bombarding people with emails. It's a simple express app with nodemailer (plus gmail).

# Notes
This was built very quickly to get a job done. I'll improve on it over time to make it more user friendly. Ideally I'd like for anyone, dev and non-dev alike, to be able to get this up and running with little to no programming experience.

Because this was built quick and dirty, there are some rough edges. For now, it's really designed to be used with gmail as the smtp server. I already have gmail and it was minimal fuss to setup with nodemailer. Instructions to hook this up are below. Additionally, program settings are merely passed via environment variables. And the program just runs until the user terminates it.

# Setup
## Prerequisites
- You have a gmail account.
- You have a GCP account (gmail may be enough here? I dunno. Mine was setup a long time ago).
- You have Docker installed.

## Configuration
To use gmail as the smtp server, follow the google-specific instructions here: https://alexb72.medium.com/how-to-send-emails-using-a-nodemailer-gmail-and-oauth2-fe19d66451f9

Note the `client_id`, `client_secret`, and `refresh_token` values from above. We'll use them below.

Create a `.env` file in the root. It should look like the following.
```
user={my_gmail_username}
client_id={my_client_id}
client_secret={my_client_secret}
refresh_token={my_refresh_token}
type={bulk|interval|fibonacci}
payload={integer}
schedule={minute|hour|day}
targets=target1@example.com,target2@example.com
```

`type` variable
- `bulk` - Send a specified amount of emails once.
- `interval` - Send a specified amount of emails at each interval.
- `fibonacci` - Send Fib-N emails every day. Caps at n=10 due to memory constraints.

`payload`
- Set to an integer value that specifies the amount of emails to send per event. For example, `type=bulk` and `payload=5` would send 5 emails one time. There are reasonable maximums imposed to limit this value to avoid doing things like sending 10000 emails per minute. While I'm not against that kind of behavior, I have no idea how this program would behave. See `app.js` for these limits.

`schedule`
 - `minute` - Send every minute.
 - `hour` - Send every hour.
 - `day` - Send every day.

`targets`
- Set to a comma separated list of email addresses or a single address.

## Email Content
### Subject
Create a file `subject.txt` in the root.

Enter your email subject line here.

### Body
Create a file `message.txt` in the root.

Enter your email body here. Whitespace formats normally. For example, the following renders as it should in the email.
```
Hello,

I'm sending these until you reply.

Warm regards,

WarmRegardsBot
```

# Use
Build with

`docker-compose build`

Run with

`docker-compose up`

Runs on `localhost:8080`

Stop with

`ctrl+c`

# Testing
There's an endpoint to manually trigger an email send. Maybe you're crafting the perfect snarky remark and want to make sure it looks just right.

Making a `GET` request to `localhost:8080/bombsaway` will send 1 email using config for recipients, email subject, and email body.

# To Do
- Better kill process when email sends should terminate.
- Make more configurable with different smtps.
- Better cron options. Variable timing. Configurable start times.
- Organize the code better.
- Create nice CLI wizard thing.

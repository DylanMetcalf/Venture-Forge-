// Phase 1 (Foundation), Days 1–30.
// Weekly rhythm: Mind · Business · Build · Influence · Judgement · Field mission · Review.
// Everything here is about the person, not any one venture: the work is done
// on your real life, real conversations and real code.
import type { CurriculumDay } from "../types";

export const FOUNDATION_MONTH1: CurriculumDay[] = [
  // ─── Week 1 · Seeing clearly ──────────────────────────────────────────
  {
    day: 1, format: "lesson", pillar: "mind",
    theme: "The Operator's Contract",
    capability: "Turn a complaint into your next move.",
    minutes: 20,
    doneWhen: "One real stuck situation is written down and rewritten as a “What's my move here…” question, with the first move named.",
    why: `Everything in this programme assumes one thing: that you'll do what you say you'll do, and that you look for your own move before you look for someone to blame. Before strategy, before skills, this is the foundation.`,
    learn: `There are two kinds of people in any room. The first group's actions are downstream of their circumstances: they explain results by pointing outward — the market, the client, the timing, the people around them. The second group's actions are upstream: they treat almost everything as something they could have influenced, prepared for, or responded to differently.

This isn't about blame. It's about where attention goes. Once a problem is “not my fault”, your brain stops looking for what you could do about it. Ask “what's my move here, given this is now my problem?” and you keep a door open that self-pity closes.

Competent people aren't people things don't go wrong for. They're people who get to their next move faster than everyone else in the room. That speed is trainable, and it starts with noticing which story you tell first.

This programme tracks actions, not intentions. Evidence, not vibes. That starts today.`,
    think: `Think of a recent setback — work, money, a relationship, a project. Where did your first explanation point: outward at circumstances, or at your own next move?`,
    act: `Write down one thing that's currently stuck or going wrong. Rewrite it as a question that starts with “What's my move here…”. Then write the smallest first move you could make in the next 48 hours.`,
    build: null,
    skills: ["responsibility", "self-awareness"],
    resource: null,
  },
  {
    day: 2, format: "lesson", pillar: "business",
    theme: "What a Business Actually Is",
    capability: "Describe any business as an exchange of value and name how it makes money.",
    minutes: 25,
    doneWhen: "Three businesses you pay regularly are each written as “They solve ___ for ___, in exchange for ___, and it costs them less because ___.”",
    why: `Walking into a room and knowing what's going on starts with seeing businesses clearly. Most people can use a product for years without being able to say how the company behind it makes money.`,
    learn: `A business is a repeatable way of creating value for someone else in exchange for more value — usually money — than it cost to create. Every clause matters. “Repeatable” rules out one-off favours. “For someone else” rules out things only you value. “More than it cost” is the difference between a business and an expensive hobby.

Value means solving a real problem, removing real friction, or giving someone something they genuinely want. It is not what the founder finds interesting to make.

Once you look for it, every business answers four questions: Who pays? For what outcome? How much, and how often? And why can they deliver it for less than they charge — scale, a skill, an asset, software, a relationship? Streaming services, gyms, banks, and the corner shop all answer these differently, and those answers explain almost everything about how they behave.

This is the lens you'll use for the rest of the year: look past the product to the exchange underneath.`,
    think: `Which company do you pay every month without being able to say exactly how it makes its money?`,
    act: `Pick three businesses you personally pay regularly. For each, write one line: “They solve ___ for ___, in exchange for ___, and it costs them less to deliver because ___.” Mark the one you're least sure about.`,
    build: null,
    skills: ["business-models", "value-creation"],
    resource: { type: "book", title: "The Personal MBA", author: "Josh Kaufman", note: "A plain-language map of how every business works: value creation, marketing, sales, delivery and finance." },
  },
  {
    day: 3, format: "technical_challenge", pillar: "build",
    theme: "How the Web Actually Works",
    capability: "Watch a real website talk to its servers and explain what you're seeing.",
    minutes: 30,
    doneWhen: "You've opened the Network tab on a real site, counted its requests, and found and read one response that returned JSON data.",
    why: `Every app you'll build, and every AI tool you'll use to build it, rests on one loop: a request goes out, a response comes back. Once you can see that loop, software stops being magic.`,
    learn: `When you open a web page, your browser sends an HTTP request to a server and gets a response back. The first response is usually HTML — the structure of the page. That HTML then triggers dozens more requests: stylesheets (how it looks), JavaScript (how it behaves), images, fonts, and calls to APIs that return data, usually as JSON.

Each request has a method (GET to fetch something, POST to send something), a URL, headers (metadata such as who you are and what format you accept) and sometimes a body. Each response has a status code — 200 is OK, 404 is not found, 401 is not authorised, 500 means the server broke — plus headers and a body.

Modern apps are mostly a thin page that keeps asking APIs for data. When you log in, like a post, or search, you're watching JSON go back and forth. Your browser will show you all of it. Developers call this the Network tab, and it's the first debugging tool worth learning.`,
    think: `Before you look: how many separate requests do you think it takes to load a news site or social feed? Write the guess down.`,
    act: `On a laptop, open a site you use (Chrome/Edge: right-click → Inspect → Network; Safari: enable Develop menu first). Reload the page. Note the total number of requests. Filter by “Fetch/XHR”, click one, and open its Response. Find one request that returned JSON and describe in plain words what data it contained.`,
    build: `Write a short note: your guess vs the actual request count, one JSON response you found, and what the page did with it.`,
    skills: ["how-the-web-works", "debugging"],
    resource: null,
  },
  {
    day: 4, format: "lesson", pillar: "influence",
    theme: "Listening Is a Skill, Not a Pause",
    capability: "Listen to understand, and prove it by playing back what someone actually meant.",
    minutes: 25,
    doneWhen: "After one real conversation today, you've written the other person's three main points and what they actually wanted — before you add any opinion of your own.",
    why: `The person who understands the room best usually controls it. You can't read people you aren't really listening to, and most people spend conversations rehearsing their reply.`,
    learn: `Most “listening” is waiting. While the other person talks, we're drafting a response, judging, or looking for an opening to tell our own story. The result is that we answer what we expected them to say, not what they said.

Skilled listeners work at three levels. Level one is the words: what was literally said. Level two is the meaning: what they're actually trying to get across, which is often not the first sentence. Level three is the want: what they need from this conversation — reassurance, a decision, to be taken seriously, to vent.

The simplest tool is the playback. Before responding, summarise: “So what you're saying is… and what matters most is… — is that right?” People feel understood when you get it right, and they correct you when you don't, which is just as useful. Negotiators, doctors and good managers use this because it's the fastest way to stop solving the wrong problem.`,
    think: `In your last disagreement, how much of the other person's actual point could you state now, in their words?`,
    act: `In one real conversation today, listen without planning your reply. Use at least one playback (“So what you're saying is…”). Afterwards, write down their three main points and what they actually wanted from the conversation.`,
    build: null,
    skills: ["listening", "reading-people"],
    resource: null,
  },
  {
    day: 5, format: "decision_exercise", pillar: "judgement",
    theme: "One-Way and Two-Way Doors",
    capability: "Match how long you deliberate to how costly the decision is to undo.",
    minutes: 20,
    doneWhen: "A decision you've been sitting on is classified as a one-way or two-way door; if it's two-way, it's made today, with a date to review it.",
    why: `Hesitation usually comes from treating every decision as if it were permanent. Most aren't. Knowing the difference is one of the fastest ways to move quickly without becoming reckless.`,
    learn: `Jeff Bezos popularised a useful frame. Type 1 decisions are one-way doors: hard or impossible to reverse — signing a long contract, quitting a job, a public commitment, a large irreversible spend. Type 2 decisions are two-way doors: if it doesn't work, you walk back through — trying a tool, testing a price, a one-week experiment, a new daily routine.

Most people slow down two-way decisions as if they were one-way: researching, planning and re-planning something that costs almost nothing to undo. Meanwhile the delay itself has a cost — time, momentum, and the information you'd have gained by just trying.

The fix isn't recklessness. It's matching deliberation to the actual cost of being wrong. For two-way doors: decide fast, set a review date, learn from the result. For one-way doors: slow down, get outside views, and consider what you'd need to believe for this to be a mistake.`,
    think: `What decision are you currently sitting on? Honestly — is it a one-way door or a two-way door?`,
    act: `Write the decision, classify it, and say why. If it's a two-way door, make the call today and write the date you'll review how it went.`,
    build: null,
    skills: ["decision-making", "responsibility"],
    resource: null,
  },
  {
    day: 6, format: "field_mission", pillar: "field",
    theme: "The Attention Audit",
    capability: "Measure where your hours actually go, not where you believe they go.",
    minutes: 20,
    doneWhen: "Today is logged in blocks as Deep / Shallow / Reactive / Lost, the totals are added up, and they're compared with the guess you wrote first.",
    why: `Attention is the resource every other resource depends on. Before you try to become more capable, see clearly where your capacity currently goes.`,
    learn: `Almost nobody knows how they spend their time. The gap between believed time and actual time is where “I'm so busy” and “nothing's moving” manage to be true at once.

Four categories are enough. Deep: focused work that builds skill or creates something — learning, building, thinking hard. Shallow: necessary but easy — admin, email, errands. Reactive: responding to other people's priorities — messages, calls, interruptions. Lost: time you can't account for or wouldn't choose again — scrolling, drifting between tabs.

Today isn't about fixing anything. It's about seeing clearly, because every future decision about focus depends on this baseline. A rough log is fine. An honest one is essential.`,
    think: `Before you start: guess what percentage of today will be Deep, Shallow, Reactive and Lost. Write it down.`,
    act: `Log today in rough blocks (every hour or two is fine) as Deep / Shallow / Reactive / Lost. Tonight, total each category and compare with your guess.`,
    build: `Your guess, your actual totals, and the one category that surprised you most.`,
    skills: ["focus", "self-awareness"],
    resource: { type: "book", title: "Deep Work", author: "Cal Newport", note: "The case for protected, distraction-free focus, and how to build a working life around it." },
  },
  {
    day: 7, format: "weekly_review", pillar: "field",
    theme: "Week 1 Review",
    capability: "Review a week honestly, from evidence rather than feel.",
    minutes: 25,
    doneWhen: "The four review questions are answered in writing with specifics, and yesterday's audit is compared with your guess.",
    why: `Every seven days the programme stops moving forward and looks back. Progress you don't review doesn't compound — it just accumulates.`,
    learn: `This is the first of 52 weekly reviews. The format stays the same all year so it becomes a habit, not a chore: what happened, what you proved, what you avoided, and what changes next week.

Be specific. “I did okay this week” is not a review. It produces no evidence and teaches you nothing the next time you have to decide whether to trust yourself. “I did four of six sessions, listened properly in two conversations, and avoided the Build task because setting up DevTools felt fiddly” is a review.`,
    think: `Look at yesterday's attention audit. How far off was your guess, and in which direction?`,
    act: `Answer in writing: What did I actually do this week? What did I prove with evidence? What did I avoid, and why? What's the one thing I'll do differently next week?`,
    build: null,
    skills: ["reflection", "self-awareness"],
    resource: null,
  },

  // ─── Week 2 · Standards and systems ──────────────────────────────────
  {
    day: 8, format: "writing_exercise", pillar: "mind",
    theme: "Set Your Standards",
    capability: "Turn vague intentions into standards you can check yourself against.",
    minutes: 25,
    doneWhen: "Three specific, checkable standards for the next 90 days are written and saved where you'll see them daily.",
    why: `Discipline lasts longer when it's anchored to a standard you set once, rather than a motivation you have to find again every morning.`,
    learn: `Motivation is a mood. Standards are a decision. “I feel like training today” is motivation. “I train Monday, Wednesday and Friday regardless of mood” is a standard. Standards survive bad days; motivation doesn't.

Most people never write their standards down. They float as vague intentions — “be more focused”, “read more” — which makes them easy to quietly drop without ever admitting it. A written standard is something you can be honest with yourself about breaking, and that honesty is the raw material of self-trust.

A good standard is specific (a person watching could tell whether you met it), within your control (not an outcome like “close three deals”), and small enough to keep on your worst week. Three is plenty. You'll grade yourself against them at every weekly review this month.`,
    think: `Where in your life do you currently run on motivation rather than a standard — something you only do when you feel like it?`,
    act: `Write three personal standards for the next 90 days. Specific and checkable: “90 minutes of deep work before messages, five days a week” — not “be more productive”.`,
    build: `Save them somewhere you'll see every day — phone lock screen, desk, the first page of your notes.`,
    skills: ["discipline", "self-awareness"],
    resource: null,
  },
  {
    day: 9, format: "financial_exercise", pillar: "business",
    theme: "Revenue, Profit and Cash Are Three Different Numbers",
    capability: "Tell revenue, profit and cash apart, and calculate each from real numbers.",
    minutes: 30,
    doneWhen: "The worked example below is calculated (gross profit, net profit, cash at month-end), and you've written one sentence on why profit and cash differ.",
    why: `Confusing these three numbers is one of the most common reasons capable people misread a business — their own or someone else's. If you can't separate them, you can't hold your own in a room where money is discussed.`,
    learn: `Revenue is everything a business earned from sales in a period — including money it's still owed. Profit is revenue minus every cost of running the business. Cash is what's actually in the bank right now.

A business can grow revenue, be profitable on paper, and still run out of cash — if customers pay late, if it has to buy stock or pay staff before it gets paid, or if a big cost lands before the matching income.

Worked example — a small software consultancy, one month:
• Invoiced R120,000 of work. Clients pay in 60 days, so none of it arrives this month.
• Contractor costs for that work: R50,000, paid this month.
• Software, office and other running costs: R25,000, paid this month.
• Cash in the bank at the start of the month: R60,000.

Gross profit = revenue − direct costs of delivering the work. Net profit = gross profit − running costs. Cash at month-end = starting cash + cash received − cash paid out.`,
    think: `Before calculating: will this business end the month richer or poorer on paper? Richer or poorer in the bank?`,
    act: `Calculate gross profit, net profit and cash at month-end for the example. Then write one sentence explaining why the business can be profitable and short of cash at the same time.`,
    build: `Your three numbers with the working shown. (Check: R70,000 gross profit, R45,000 net profit, −R15,000 cash.)`,
    skills: ["financial-statements", "cash-flow"],
    resource: null,
  },
  {
    day: 10, format: "technical_challenge", pillar: "build",
    theme: "Git: Save Points for Your Work",
    capability: "Create a repository, commit changes, branch and merge — without an AI doing it for you.",
    minutes: 40,
    doneWhen: "A repository exists with at least three commits, one branch that was merged back, and you can explain what each command did.",
    why: `Every serious piece of software lives in version control. If you're going to direct AI to write code, you need to be able to see exactly what changed, undo it, and try ideas safely.`,
    learn: `Git records the history of a project as a series of snapshots called commits. Each commit says: here's exactly what changed, who changed it, when, and why (the message). You can go back to any commit, compare any two, and see who wrote each line.

A branch is a parallel line of work. You branch off to try something without risking the working version; if it works, you merge it back; if not, you delete the branch and nothing is lost. This is how you can let an AI make big changes fearlessly: branch first, review the diff, keep what's good.

The core loop is small:
git init — start tracking a folder
git status — what has changed?
git add <file> — stage a change for the next commit
git commit -m "message" — save the snapshot
git log --oneline — see history
git switch -c <name> — create and move to a new branch
git merge <name> — bring a branch's work into the current branch

GitHub is a website that hosts Git repositories so they're backed up and shareable. Git itself runs on your machine.`,
    think: `If an AI tool rewrote half your project tomorrow and broke it, how would you currently get back to the working version?`,
    act: `In a terminal: create a folder, run git init, add a text file and commit it. Make two more commits with meaningful messages. Create a branch, change something, commit, switch back and merge it. Run git log --oneline and read the history.`,
    build: `Paste your git log --oneline output and one sentence on what a branch is for, in your own words.`,
    skills: ["git", "programming"],
    resource: { type: "book", title: "Pro Git", author: "Scott Chacon and Ben Straub", note: "The free official Git book. Chapters 2 and 3 cover everything in today's session." },
  },
  {
    day: 11, format: "roleplay", pillar: "influence",
    theme: "Questions That Open People Up",
    capability: "Ask questions that get people to tell you what's really going on.",
    minutes: 25,
    doneWhen: "In two real conversations you've asked at least three open questions and one “what else?”, and written down one thing you learned that you wouldn't have otherwise.",
    why: `The person asking the best questions usually ends up knowing the most in any room. Good questions are how you find out what's really going on without having to be told.`,
    learn: `Closed questions get yes, no, or a fact: “Did the meeting go well?” — “Yeah.” Open questions invite a story: “Walk me through how the meeting went.” Stories carry the detail people leave out when they summarise: who said what, what surprised them, what they're worried about.

Three questions do most of the work:
• “Tell me about the last time…” — anchors people in a real event instead of opinions or predictions. What people did is far more reliable than what they say they'd do.
• “What makes that hard?” — surfaces the real problem behind the stated one.
• “What else?” — asked after they seem finished. The most important thing is often the second or third thing someone says.

Then stay quiet. Silence after a question feels uncomfortable, and most people fill it with more than they planned to share. Let them.`,
    think: `In your conversations this week, how many questions did you ask that could only be answered with a story?`,
    act: `In two real conversations today, ask at least three open questions — including one “Tell me about the last time…” — and one “What else?”. Don't fill the silences. Afterwards, write what you learned that you wouldn't otherwise have heard.`,
    build: null,
    skills: ["questioning", "listening"],
    resource: null,
  },
  {
    day: 12, format: "lesson", pillar: "judgement",
    theme: "First Principles",
    capability: "Strip an assumption back to what's actually true, and find options analogy can't see.",
    minutes: 30,
    doneWhen: "One assumption you hold about your career, money or skills is broken down to its underlying need, with two alternatives you hadn't seriously considered.",
    why: `Reasoning by analogy (“this is how it's usually done”) is fast but copies everyone else's limits. First-principles reasoning is slower, but it finds options the crowd can't see.`,
    learn: `Reasoning by analogy asks: what has worked before in situations like this? Reasoning from first principles asks: what's fundamentally true here, whatever the precedent, and what follows from that?

Example: “To become a software developer you need a degree and years of junior jobs.” That's analogy — it's how it has usually worked. First principles asks what the goal actually requires: the ability to build working software that solves real problems, and proof that you can. A degree is one route to that. Building and shipping real tools with AI assistance, publicly, is another. Contributing to real projects is a third.

The method: state the belief. Ask “why is this true?” until you reach something that can't be broken down further — a physical, economic or human fact. Then rebuild from those facts and see which options appear that weren't visible before.`,
    think: `What's one belief about how your career, your learning or your finances “have to” work that you've never actually tested?`,
    act: `Write the belief. Ask “why?” at least four times until you reach the underlying need. Then list two genuinely different ways to meet that need.`,
    build: null,
    skills: ["first-principles", "decision-making"],
    resource: null,
  },
  {
    day: 13, format: "field_mission", pillar: "field",
    theme: "One Uncomfortable Action",
    capability: "Act on something important despite discomfort.",
    minutes: 30,
    doneWhen: "The thing you've been avoiding is done today, and what actually happened is recorded next to what you feared would happen.",
    why: `Courage is built like any other capability: by doing the specific rep, not by waiting until you feel ready.`,
    learn: `This programme will regularly ask you to do something that causes a small, specific discomfort: a call you're avoiding, a message you're putting off, a request you're scared to make, a correction you need to deliver. The discomfort is the point, not a side effect. Avoidance compounds just like progress does — in the wrong direction.

The standard is small and concrete. Not “be braver” in general, but one identifiable action, today, that you've put off because it's uncomfortable rather than because it genuinely doesn't matter.

Before you do it, write what you expect to happen. Afterwards, write what actually happened. Most of the time the gap is large, and seeing that gap in writing is what makes the next rep easier.`,
    think: null,
    act: `Name one thing you've been avoiding because it's uncomfortable. Write what you fear will happen. Then do it today.`,
    build: `What you did, what you feared, and what actually happened.`,
    skills: ["courage", "responsibility"],
    resource: null,
  },
  {
    day: 14, format: "weekly_review", pillar: "field",
    theme: "Week 2 Review",
    capability: "Grade yourself honestly against your own written standards.",
    minutes: 25,
    doneWhen: "Each Day 8 standard has an honest grade with a reason, and the review questions are answered.",
    why: `The second review. The point of repetition is that the format disappears and the honesty gets easier.`,
    learn: null,
    think: `Look at the three standards you wrote on Day 8. Graded honestly, how did you do on each?`,
    act: `Answer in writing: What did I actually do this week? What did I prove? What did I avoid? What's the one change for next week?`,
    build: null,
    skills: ["reflection", "discipline"],
    resource: null,
  },

  // ─── Week 3 · Pressure and people ────────────────────────────────────
  {
    day: 15, format: "lesson", pillar: "mind",
    theme: "Discipline Is Design, Not Willpower",
    capability: "Redesign your environment so the right action is the easy one.",
    minutes: 20,
    doneWhen: "One real piece of friction is changed today — either making a good action easier to start or a bad one harder — and you can say exactly what you changed.",
    why: `You won't feel like doing most of what this programme asks, most of the time. That's expected. The people who look disciplined have usually just designed their environment better.`,
    learn: `Discipline is usually described as a trait some people have and others don't. It's more useful to treat it as a design problem: discipline is what happens when starting the right action costs less than not starting it.

Three levers do the work:
• Reduce friction on what you want: laptop open on the right file the night before, gym bag by the door, today's session bookmarked on your phone's home screen.
• Add friction to what you don't: log out of distracting apps, put the phone in another room during deep work, remove saved passwords from time sinks.
• Shrink the unit of commitment: “open the editor and write one function” is easier to start than “build the feature”. Starting is the hard part; momentum does the rest.

Rely on willpower and you'll lose to a tired Tuesday. Rely on design and even a bad day tends towards the right action.`,
    think: `Pick one thing you keep avoiding. What's the mechanical friction — not the excuse, the actual friction — that makes it harder to start than it needs to be?`,
    act: `Change one piece of friction today: make a good action easier to start, or an avoidance harder to fall into.`,
    build: null,
    skills: ["discipline", "focus"],
    resource: { type: "book", title: "Atomic Habits", author: "James Clear", note: "A practical guide to shaping behaviour through environment and small, repeatable systems." },
  },
  {
    day: 16, format: "case_study", pillar: "business",
    theme: "Value Is Not the Same as Price",
    capability: "Work out what a buyer is really paying for, beyond the product itself.",
    minutes: 25,
    doneWhen: "For one skill you could sell today, you've named the specific buyer, the outcome they're really paying for, and what that outcome is worth to them.",
    why: `If you only understand cost, you'll always undercharge — for your time, your work and your products. Seeing value the way buyers see it is where commercial judgement starts.`,
    learn: `Case: two developers can each build the same internal tool for a business. One quotes by the hour: 40 hours at R500, so R20,000. The other asks questions first and learns that the business's staff spend 30 hours a week copying data between two systems, and that errors in that copying cost them a client last quarter. She quotes R90,000 — and wins, because the price is tied to what the outcome is worth to the buyer, not to what it cost to produce.

Price tied only to cost caps what you earn at “hours plus a margin”, forever. Price tied to value can be much higher, but only if you understand specifically what the buyer is buying: time saved, risk removed, revenue gained, status, certainty, speed.

The skill isn't in charging more. It's in asking enough questions to see the value before you name a number.`,
    think: `For a skill you already have (building with AI, operations, anything), what outcome would someone actually be paying for — and what's that outcome worth to them?`,
    act: `Pick one skill you could sell. Write: the specific buyer, the problem it solves for them, what that problem currently costs them (time, money, risk), and a price anchored to that value rather than your hours.`,
    build: null,
    skills: ["pricing", "value-creation"],
    resource: null,
  },
  {
    day: 17, format: "technical_challenge", pillar: "build",
    theme: "Spec Before You Prompt",
    capability: "Direct an AI to build something by writing a clear spec, then review what it produced.",
    minutes: 45,
    doneWhen: "A one-page spec for a tiny tool exists, an AI has built it, and you've read every line of the result and listed what you'd have missed without reading.",
    why: `AI can write most code now. The scarce skill is knowing exactly what to ask for and being able to tell whether what came back is right. That's what separates someone who builds with AI from someone who's just copying from it.`,
    learn: `A vague prompt (“make me a budgeting app”) makes the AI guess, and you won't notice which guesses are wrong until later. A spec removes the guessing. It's just a short document that answers:

• Purpose — what problem this solves, for whom, in one sentence.
• Inputs and outputs — what goes in, what comes out, in what format.
• Behaviour — the main steps, plus the edge cases: empty input, bad input, very large input.
• Constraints — language, no external services, runs in a browser, and so on.
• Done when — how you'll check that it works.

Then review. Read every line the AI produced. For each part, ask: do I understand what this does? Does it match the spec? What happens on the edge cases? You'll find things — invented requirements, missed edge cases, confident code that doesn't do what it claims. Finding them is the skill.`,
    think: `The last time you used AI to build something, how much of the result did you actually read and understand?`,
    act: `Pick a tiny tool you'd actually use (a tip splitter, a word counter, a converter). Write a one-page spec using the headings above. Give it to an AI, run the result, and read every line. List what didn't match your spec and what you only caught by reading.`,
    build: `Your spec, and the list of issues you found in the AI's output.`,
    skills: ["ai-assisted-development", "prompting"],
    resource: null,
  },
  {
    day: 18, format: "lesson", pillar: "influence",
    theme: "Reading a Room",
    capability: "Walk into a group and work out who holds power, who decides, and what the tension is.",
    minutes: 25,
    doneWhen: "After one group situation today, you've written down who held status, who actually made the call, and one unspoken tension — plus how you'll check whether you read it right.",
    why: `Knowing what's going on in a room is rarely about what's said. It's about noticing who defers to whom, where attention goes, and what nobody is saying.`,
    learn: `Every group has a visible structure (job titles, who's running the meeting) and a real one. Reading a room means seeing the real one. Watch for:

• Attention: when something is said, whose face do people check? That person has influence, whatever their title.
• Deference: who gets interrupted, and who doesn't? Who speaks last? Senior people often wait and speak last.
• Baseline and change: how does each person normally behave? The signal is in the change — someone who's usually talkative going quiet, a sudden change in tone, arms folding when one topic comes up.
• What isn't said: the topic everyone avoids, or the decision people discuss as if it's already been made.

Treat each read as a hypothesis, not a fact. The skill is noticing, guessing, then checking — asking a trusted person afterwards, or watching what actually happens next. Over time your guesses get better.`,
    think: `In the last group you were part of — work, family, friends — who really made the decisions? How do you know?`,
    act: `In your next group situation (meeting, dinner, call), observe instead of performing. Afterwards, write: who held status, who actually decided, one tension nobody named, and how you'll test your read.`,
    build: null,
    skills: ["reading-rooms", "reading-people"],
    resource: null,
  },
  {
    day: 19, format: "decision_exercise", pillar: "judgement",
    theme: "Think in Probabilities",
    capability: "Put numbers on your beliefs so reality can grade them.",
    minutes: 20,
    doneWhen: "Five specific predictions about the next 11 days are written, each with a percentage confidence, to be scored at the Day 30 review.",
    why: `“I think so” and “probably” can't be wrong, so they never teach you anything. A number can be wrong, and that's exactly why it makes your judgement better over time.`,
    learn: `Almost nothing important is certain. Skilled decision-makers don't pretend otherwise. They say “70% likely” instead of “yes”, and then they keep score.

Two ideas matter here. Calibration: if you say 70% on ten different things, about seven should happen. If nine happen, you're underconfident; if four do, you're overconfident. Most people are badly overconfident, and they never find out because they never write the number down.

Separate decisions from outcomes: a good decision can have a bad outcome (you took a sensible 80% bet and lost), and a bad decision can get lucky. Judging decisions only by how they turned out — what poker players call “resulting” — teaches you the wrong lessons.

Today you start keeping score.`,
    think: `How often do you say “definitely” about things that are really about 70% likely?`,
    act: `Write five specific predictions that will resolve by Day 30 — about work, your habits, other people, the news — each with a percentage confidence. Make them specific enough that there's no argument about whether they came true.`,
    build: `Your five predictions with percentages. You'll score them on Day 30.`,
    skills: ["probabilistic-thinking", "decision-making"],
    resource: { type: "book", title: "Thinking in Bets", author: "Annie Duke", note: "A former professional poker player on separating decision quality from outcomes." },
  },
  {
    day: 20, format: "field_mission", pillar: "field",
    theme: "Find a Real Problem Worth Solving",
    capability: "Uncover a real problem through conversation, without pitching or leading.",
    minutes: 40,
    doneWhen: "You've had one real conversation about a problem someone faces, recorded their exact words about the last time it happened, and pitched nothing.",
    why: `Everything so far has been in your head or on your screen. Today it meets a real person. Being able to uncover real problems is what makes a builder commercially dangerous.`,
    learn: `Most people ask about problems badly: “Would you use an app that…?” People are polite, so they say yes, and it means nothing. What people say they'd do and what they actually do are very different.

Instead, ask about the past, not the future. Pick someone you know who deals with a repetitive or frustrating part of their work or life. Ask:
• “Tell me about the last time you had to deal with ___.”
• “What did you do about it? What did that cost you — time, money, stress?”
• “Have you tried anything to fix it? What happened?”

If they've never tried to fix it, the problem probably isn't painful enough to pay for. If they've hacked together their own workaround, pay attention — that's a real problem.

Don't mention your idea. Don't pitch. Listen, use yesterday's and last week's skills, and write down their exact words.`,
    think: null,
    act: `Have one real conversation today, in person or by phone, using the questions above. Pitch nothing. Write down exactly what they said, not your interpretation of it.`,
    build: `Their exact words about the last time the problem happened, what it cost them, and whether they've tried to fix it.`,
    skills: ["customer-discovery", "questioning"],
    resource: { type: "book", title: "The Mom Test", author: "Rob Fitzpatrick", note: "How to talk to people about their problems without them lying to you to be nice." },
  },
  {
    day: 21, format: "weekly_review", pillar: "field",
    theme: "Week 3 Review",
    capability: "Separate what you've tested from what you're still assuming.",
    minutes: 25,
    doneWhen: "The review is answered, with at least one belief marked “tested” and one marked “still a guess”.",
    why: `Three weeks of evidence is starting to be a pattern, not a coincidence.`,
    learn: null,
    think: `What did Day 20's conversation tell you that you couldn't have worked out on your own?`,
    act: `Answer in writing: What did I actually do this week? What did I prove with evidence, rather than assume? What's still just a guess? How did I do against my Day 8 standards? What matters next week?`,
    build: null,
    skills: ["reflection", "customer-discovery"],
    resource: null,
  },

  // ─── Week 4 · Leverage ───────────────────────────────────────────────
  {
    day: 22, format: "lesson", pillar: "mind",
    theme: "Composure Under Pressure",
    capability: "Get your body and mind back under control in the moment, and act instead of react.",
    minutes: 20,
    doneWhen: "You've practised the physiological sigh and emotion labelling, and used them once in a real moment of stress, irritation or nerves, logging what happened.",
    why: `The calmest person in the room gets to choose what happens next. Composure isn't a personality trait — it's a set of techniques you can practise.`,
    learn: `Under stress your body moves first: heart rate up, breathing shallow, attention narrowing. Your thinking then follows your body. So the fastest way to regain control starts with the body, not the mind.

Technique one, the physiological sigh: two inhales through the nose (a full breath, then a short top-up), then a long, slow exhale through the mouth. One to three rounds. The long exhale is what slows the heart rate. It's quick, and nobody notices you doing it.

Technique two, name the emotion: silently label what you feel, as precisely as you can — “I'm irritated”, “I'm anxious about being judged”. Research on affect labelling suggests that naming an emotion reduces its intensity. Once you've named it, you're observing it rather than being run by it.

Technique three, buy time: “Let me think about that.” A pause almost always reads as confidence, not weakness.

Practise them when you're calm, so they're available when you're not.`,
    think: `When did you last react in a way you regretted? What was your body doing just before?`,
    act: `Practise three physiological sighs now. Then, the next time today that you feel stressed, irritated or nervous, use a sigh plus a precise emotion label before you respond. Log what happened.`,
    build: null,
    skills: ["composure", "emotional-regulation"],
    resource: null,
  },
  {
    day: 23, format: "financial_exercise", pillar: "business",
    theme: "Unit Economics: What One Customer Is Worth",
    capability: "Work out whether a business makes money on each customer.",
    minutes: 35,
    doneWhen: "Contribution per customer, lifetime value and payback period are calculated for the example below, and you've written whether the business is healthy and why.",
    why: `Unit economics is the fastest way to tell whether a business works. It's the question investors, acquirers and good operators ask first, and it's the one to ask of any product you build.`,
    learn: `Unit economics asks: on one unit — usually one customer — do we make or lose money, and how fast do we get our money back?

The key numbers:
• Contribution per month = price − the cost of serving that customer (hosting, AI usage, payment fees, support).
• Customer lifetime value (LTV) ≈ contribution per month × average months a customer stays. If 5% of customers leave each month, the average customer stays about 1 ÷ 0.05 = 20 months.
• Customer acquisition cost (CAC) = what it costs to win one customer: ads, sales time, free trials.
• Payback period = CAC ÷ contribution per month.

A common rule of thumb: LTV should be at least three times CAC, and payback should be under about 12 months.

Example — an AI tool for small businesses: price R400/month. Costs to serve each customer: R80 in AI usage and hosting, R20 in payment fees and support. 5% of customers cancel each month. Winning each customer costs R1,500 in ads and demos.`,
    think: `Before calculating: does this business look healthy to you, on instinct?`,
    act: `Calculate contribution per month, average customer lifetime, LTV, the LTV:CAC ratio and the payback period. Then write two sentences: is it healthy, and which single number would you work to improve first?`,
    build: `Your calculations. (Check: R300 contribution, 20 months, R6,000 LTV, 4:1 LTV:CAC, 5-month payback.)`,
    skills: ["unit-economics", "financial-statements"],
    resource: null,
  },
  {
    day: 24, format: "technical_challenge", pillar: "build",
    theme: "How Software Remembers: Data Models",
    capability: "Design the tables behind a simple app — things, their fields, and how they relate.",
    minutes: 40,
    doneWhen: "A data model for a small app is written: at least three tables with their fields and types, how they relate (one-to-many), and one question the data can answer.",
    why: `Most software is a database with a screen on top. If you can design the data model, you understand the app. It's also the part where AI-generated code most often makes costly mistakes.`,
    learn: `A relational database stores data in tables. Each table holds one kind of thing: users, workouts, invoices. Each row is one instance; each column is a field with a type (text, number, date, true/false). Every row has an id that uniquely identifies it.

Relationships connect tables. In a one-to-many relationship — one user has many workouts — the “many” side stores the id of the “one” side (workouts.user_id). A many-to-many relationship — workouts contain many exercises, and exercises appear in many workouts — needs a join table (workout_exercises) holding both ids.

Good models have each fact stored in exactly one place. Store a user's email once, in users, not copied into every workout. When you change it, it's then correct everywhere.

This app works the same way: sessions, evidence items and skills are linked by ids — Supabase, where it's headed later, is built on exactly this kind of relational database (Postgres).`,
    think: `Think of an app you use daily. What are its main “things”, and how do they connect?`,
    act: `Design the data model for a small app you'd actually use (a habit tracker, a reading log, a gym log). Write each table, its fields with types, and the relationships. Then write one useful question the data could answer, such as “which habit have I kept longest?”.`,
    build: `Your tables, fields and relationships, plus the question.`,
    skills: ["databases", "architecture"],
    resource: null,
  },
  {
    day: 25, format: "sales_challenge", pillar: "influence",
    theme: "Negotiation: Know Your Walk-Away",
    capability: "Prepare for a negotiation so you know your alternatives, your target and your line.",
    minutes: 30,
    doneWhen: "For one real negotiation (current or upcoming), you've written your BATNA, target, walk-away point and first offer — or you've made one low-stakes ask today and recorded what happened.",
    why: `Most negotiations are lost before they start, because one side never worked out what they'd do if there was no deal. Preparation is where the power comes from.`,
    learn: `Your BATNA — best alternative to a negotiated agreement — is what you'll do if this deal falls through. It's your real source of power. If you have a strong alternative, you can walk away calmly; if you don't, the other side can usually feel it.

Before any negotiation, write down four things:
• BATNA — what I'll do if we don't agree.
• Target — the ambitious but defensible outcome I want.
• Walk-away — the point where my BATNA is better than this deal.
• Anchor — my first offer. The first number mentioned tends to pull the final result towards it (anchoring), so, where you can, anchor first and with a reason.

In the conversation, labelling helps: “It sounds like the timeline is your biggest concern.” Naming what the other side feels lowers tension and gets them explaining. And don't split the difference by reflex — ask what they need, and trade things you value less for things you value more.`,
    think: `What's one negotiation — salary, rate, purchase, deadline, division of work — that you'll face in the next month?`,
    act: `Prepare that negotiation on paper: BATNA, target, walk-away, anchor, and one label you might use. If nothing is coming up, make one polite, low-stakes ask today (a better rate, an upgrade, a discount) and record exactly what happened.`,
    build: null,
    skills: ["negotiation", "persuasion"],
    resource: { type: "book", title: "Never Split the Difference", author: "Chris Voss", note: "A former FBI hostage negotiator on labelling, mirroring and calibrated questions." },
  },
  {
    day: 26, format: "decision_exercise", pillar: "judgement",
    theme: "Second-Order Thinking",
    capability: "Ask “and then what?” until you can see the consequences others miss.",
    minutes: 25,
    doneWhen: "For a real decision you're facing, two options are mapped to first, second and third-order effects, and you've noted which option looks different once you do.",
    why: `Most people stop at the first consequence. The advantage goes to whoever keeps asking “and then what?”.`,
    learn: `First-order thinking asks: what happens immediately if I do this? Second-order thinking keeps going: and then what? And then what after that?

Examples:
• Taking every client who asks: first order, more revenue. Second order, no time to build anything scalable. Third order, you're stuck trading hours for money.
• Letting AI write code you don't review: first order, you ship faster. Second order, you don't understand your own codebase. Third order, every bug takes longer to fix, and you can't tell good output from bad.
• Spending an hour every day on deliberate practice: first order, one less hour of leisure. Second order, compounding skill. Third order, options most people never get.

The pattern: good long-term choices often feel worse at first order, and bad ones often feel better. That's exactly why most people make the wrong call — and why you won't, if you keep going to the next order.`,
    think: `What's one choice you're making now purely for its first-order effect?`,
    act: `Take a real decision you're facing. For two options, write the first, second and third-order effects of each. Note whether the option that looks best changes when you get to the second and third orders.`,
    build: null,
    skills: ["second-order-thinking", "systems-thinking"],
    resource: null,
  },
  {
    day: 27, format: "field_mission", pillar: "field",
    theme: "Ship Something Small Today",
    capability: "Go from problem to working tool in one sitting, using AI, and actually use it.",
    minutes: 90,
    doneWhen: "A small tool that solves one of your own recurring annoyances is working and has been used at least once, with the spec, the code in a Git repository, and a note on what you'd improve.",
    why: `This combines everything: a real problem (Day 20), a spec (Day 17), data (Day 24), version control (Day 10) and judgement about what's good enough. Shipping small things often is how builders are made.`,
    learn: `Pick something small and genuinely annoying in your own life: a calculation you keep redoing, a list you keep rebuilding, a message you keep retyping, a file you keep renaming. The smaller the better. The goal is a full loop — problem, spec, build, review, use — not something impressive.

Rules for today:
• Timebox it to 90 minutes. Cut scope, not quality.
• Spec first, in five lines.
• Commit to Git as you go.
• Read what the AI writes. If you don't understand a part, ask it to explain, or simplify it until you do.
• Use it for real at least once before you stop.

A small tool that works and gets used is worth more than a big one that's 80% finished.`,
    think: `What small, recurring annoyance costs you a few minutes every week?`,
    act: `Build a tool that solves it, following the rules above. Use it once for real.`,
    build: `The spec, a link to the repository or a screenshot of the tool working, and one thing you'd improve next.`,
    skills: ["ai-assisted-development", "product-thinking", "git"],
    resource: null,
  },
  {
    day: 28, format: "weekly_review", pillar: "field",
    theme: "Week 4 Review",
    capability: "Assess four weeks of behaviour against your own standards.",
    minutes: 25,
    doneWhen: "Your Day 8 standards are graded across the last three weeks, and the review questions are answered.",
    why: `The last weekly review before the Month 1 capability review.`,
    learn: null,
    think: `Reread your Day 8 standards. Across the last three weeks, where did you actually hold them, and where did you quietly let them slide?`,
    act: `Answer in writing: What did I build, prove or change this week? Where did I hold my standards, and where didn't I? What did I avoid? What should change going into Month 2?`,
    build: null,
    skills: ["reflection", "discipline"],
    resource: null,
  },
  {
    day: 29, format: "case_study", pillar: "business",
    theme: "The Profitable Company That Went Bankrupt",
    capability: "Spot a cash-timing trap before it becomes a crisis.",
    minutes: 25,
    doneWhen: "You've identified the two decisions that killed the company in the case, and written the one question you'd ask any business to test for the same risk.",
    why: `This is the fullest version of what Day 9 introduced, and it's one of the most common ways otherwise good businesses fail.`,
    learn: `Case (a composite of a common pattern, not a single real company): a growing software agency wins a large, prestigious contract with a corporate client. The margin is healthy — on paper, it's the best deal in the company's history. To deliver it, the agency hires four developers and pays them monthly. The client pays 90 days after each invoice, and its procurement process adds another month.

To bridge the gap, the agency spends its cash reserves, then its overdraft. A smaller client pays late too. In month five, profitable the whole time on paper, the agency can't make payroll. Two key developers leave. Delivery slips, the corporate client delays payment further over the delays, and the business collapses.

It didn't fail from bad work, bad pricing or low demand. It failed because it committed fixed monthly costs to fund revenue that arrived months later — and never modelled when the cash would come in, month by month.`,
    think: `Which two decisions, if made differently, would have saved this company?`,
    act: `Write the two decisions that killed it and what you'd have done instead. Then write the one question you'd ask any business — including one you might join or build — to test for this risk.`,
    build: null,
    skills: ["cash-flow", "financial-statements"],
    resource: null,
  },
  {
    day: 30, format: "monthly_review", pillar: "field",
    theme: "Month 1 Capability Review",
    capability: "Judge how your capability changed on evidence, not effort.",
    minutes: 60,
    doneWhen: "The Month 1 review is written, your Day 19 predictions are scored, and at least one concrete piece of evidence from this month is cited.",
    why: `The first monthly checkpoint. Not a celebration of 30 days completed — an honest look at what actually changed.`,
    learn: `This programme measures capability, not completion. Thirty finished sessions is not itself the achievement. What matters is what you can now do, see or decide that you genuinely couldn't a month ago — backed by evidence you created, not a feeling of having been busy.

Score your Day 19 predictions first. For each, mark it right or wrong, then look at your confidence levels. Were your 80%s right about 80% of the time? This is your first calibration data.

This review format repeats every month: Mind, Business, Build, Influence, Judgement, time, and what deserves attention next.`,
    think: `Reread everything you wrote this month. What's the single clearest piece of evidence that you're more capable now than on Day 1?`,
    act: `Write the full Month 1 review. Predictions — score all five; were you over- or underconfident? Mind — how did you do against your standards? Business — what can you now read or calculate that you couldn't before? Build — what did you ship? Influence — what did you notice in people that you'd have missed a month ago? Judgement — which decision went better because of something you learned? Time — where did it actually go? Next month — what deserves the most attention?`,
    build: `This closes Month 1 of Foundation. Days 31–52 continue the same rhythm and deepen each pillar.`,
    skills: ["reflection", "self-awareness", "probabilistic-thinking"],
    resource: null,
  },
];

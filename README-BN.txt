নতুন খতিয়ান প্রজেক্ট
====================

১) নতুন Supabase Project তৈরি করুন।
২) SQL Editor-এ supabase.sql চালান।
৩) config.js-এ নতুন Supabase URL, Publishable key এবং Admin email বসান।
৪) Auth > Users-এ একই Admin email/password দিয়ে একটি user তৈরি করুন।
৫) এই পুরো folder-টি আলাদা hosting/domain/folder-এ upload করুন।

প্রধান ফাইল:
- index.html          : সাধারণ খতিয়ান দেখার পেজ
- admin.html          : লগইন + সাধারণ/রেডি খতিয়ান ম্যানেজমেন্ট
- ready-khatian.html  : নতুন রেডি খতিয়ানের সব তথ্য পূরণ করার ফর্ম
- ready-khatian-view.html : ডেমো লে-আউটে public ready khatian
- assets/KHATIYAN_RS_template.jpg : আপনার দেওয়া ডেমো লে-আউট

গুরুত্বপূর্ণ:
- এটা আপনার আগের প্রজেক্ট থেকে সম্পূর্ণ আলাদা।
- পুরোনো Supabase/database বা পুরোনো hosting-এ এটি ব্যবহার করার দরকার নেই।
- QR Code বর্তমান public URL থেকেই তৈরি হয়।
- ready_khatian record ডিলেট হলে public SELECT-এ আর দেখা যায় না, তাই পুরোনো URL খুললে 404 পেজ আসে।
- config.js-এ কখনো service_role/secret key দেবেন না।

import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="ডিসক্লেইমার" color="var(--gradient-primary)" />

      <div className="px-4 py-4 space-y-4">
        <div className="glass-card p-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-bold text-foreground">সাধারণ দাবিত্যাগ</h2>
          <p>রামগঞ্জ সিটি অ্যাপে প্রদত্ত সকল তথ্য শুধুমাত্র সাধারণ তথ্যের উদ্দেশ্যে। আমরা তথ্যের যথার্থতা নিশ্চিত করতে সর্বোচ্চ চেষ্টা করি, তবে কোনো তথ্যের সম্পূর্ণতা বা নির্ভুলতার নিশ্চয়তা প্রদান করি না।</p>

          <h2 className="text-base font-bold text-foreground">দায়সীমা</h2>
          <p>এই অ্যাপের তথ্য ব্যবহারে কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য রামগঞ্জ সিটি দায়ী নয়। ব্যবহারকারীরা নিজ দায়িত্বে তথ্য যাচাই করে ব্যবহার করবেন।</p>

          <h2 className="text-base font-bold text-foreground">তৃতীয় পক্ষের লিংক</h2>
          <p>অ্যাপে তৃতীয় পক্ষের ওয়েবসাইটের লিংক থাকতে পারে। এসব সাইটের কন্টেন্ট বা প্রাইভেসি পলিসির উপর আমাদের কোনো নিয়ন্ত্রণ নেই।</p>

          <h2 className="text-base font-bold text-foreground">ব্যবসায়িক তথ্য</h2>
          <p>অ্যাপে তালিকাভুক্ত ব্যবসা, সেবা ও পণ্যের তথ্য সংশ্লিষ্ট প্রতিষ্ঠান বা ব্যক্তি কর্তৃক প্রদত্ত। আমরা এসব তথ্যের সত্যতা বা মানের নিশ্চয়তা দিই না।</p>

          <h2 className="text-base font-bold text-foreground">পরিবর্তন</h2>
          <p>এই ডিসক্লেইমার যেকোনো সময় পরিবর্তন করা হতে পারে। নিয়মিত এই পেজ দেখার অনুরোধ করা হচ্ছে।</p>

          <p className="text-xs text-muted-foreground/60 pt-2">সর্বশেষ আপডেট: মার্চ ২০২৬</p>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Disclaimer;

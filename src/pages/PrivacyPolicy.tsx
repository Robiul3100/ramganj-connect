import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title="প্রাইভেসি পলিসি" color="var(--gradient-primary)" />

      <div className="px-4 py-4 space-y-4">
        <div className="glass-card p-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-bold text-foreground">তথ্য সংগ্রহ</h2>
          <p>রামগঞ্জ সিটি অ্যাপ ব্যবহারকারীদের ব্যক্তিগত তথ্য যেমন নাম, ফোন নম্বর এবং ইমেইল সংগ্রহ করতে পারে। এই তথ্য শুধুমাত্র সেবা প্রদানের উদ্দেশ্যে ব্যবহৃত হয়।</p>

          <h2 className="text-base font-bold text-foreground">তথ্যের ব্যবহার</h2>
          <p>সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহৃত হয়:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>অ্যাপের সেবা উন্নত করতে</li>
            <li>ব্যবহারকারীদের সাথে যোগাযোগ করতে</li>
            <li>নোটিফিকেশন পাঠাতে</li>
            <li>পরিসংখ্যানগত বিশ্লেষণ করতে</li>
          </ul>

          <h2 className="text-base font-bold text-foreground">তথ্যের নিরাপত্তা</h2>
          <p>আমরা ব্যবহারকারীদের তথ্যের নিরাপত্তা নিশ্চিত করতে যথাযথ প্রযুক্তিগত ব্যবস্থা গ্রহণ করি। তবে ইন্টারনেটের মাধ্যমে কোনো তথ্য আদান-প্রদান ১০০% নিরাপদ নয়।</p>

          <h2 className="text-base font-bold text-foreground">তৃতীয় পক্ষ</h2>
          <p>আমরা ব্যবহারকারীদের ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করি না, আইনগত বাধ্যবাধকতা ব্যতীত।</p>

          <h2 className="text-base font-bold text-foreground">কুকিজ</h2>
          <p>অ্যাপটি ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে কুকিজ এবং লোকাল স্টোরেজ ব্যবহার করতে পারে।</p>

          <h2 className="text-base font-bold text-foreground">পরিবর্তন</h2>
          <p>এই প্রাইভেসি পলিসি যেকোনো সময় আপডেট করা হতে পারে। পরিবর্তনগুলো এই পেজে প্রকাশ করা হবে।</p>

          <p className="text-xs text-muted-foreground/60 pt-2">সর্বশেষ আপডেট: মার্চ ২০২৬</p>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PrivacyPolicy;

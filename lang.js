/*
 * AjahFi lightweight i18n.
 * - Translates static text + translatable attributes (placeholder/title/aria-label).
 * - A MutationObserver re-translates content rendered later by page scripts.
 * - Language choice persists in localStorage ('ajahfi_lang').
 *
 * To add strings: add "English text": { hi: "…", or: "…" } to DICT below.
 * Exact (trimmed) matches only, so labels stay reliable and data values are
 * never mangled. Some Hindi/Odia strings are machine-assisted and may benefit
 * from a native-speaker review.
 */
(function (global) {
    'use strict';

    var LANG_KEY = 'ajahfi_lang';
    var LANGS = ['en', 'hi', 'or'];
    var LABELS = { en: 'EN', hi: 'हिंदी', or: 'ଓଡ଼ିଆ' };
    var HTML_LANG = { en: 'en', hi: 'hi', or: 'or' };

    // English -> { hi, or }
    var DICT = {
        // --- Sidebar / navigation ---
        'Dashboard': { hi: 'डैशबोर्ड', or: 'ଡ୍ୟାସବୋର୍ଡ' },
        'Farmers': { hi: 'किसान', or: 'କୃଷକ' },
        'Suraksha Didis': { hi: 'सुरक्षा दीदी', or: 'ସୁରକ୍ଷା ଦିଦି' },
        'Goats': { hi: 'बकरियाँ', or: 'ଛେଳି' },
        'Claims': { hi: 'दावे', or: 'ଦାବି' },
        'Reports': { hi: 'रिपोर्ट', or: 'ରିପୋର୍ଟ' },
        'Activity Log': { hi: 'गतिविधि लॉग', or: 'କାର୍ଯ୍ୟକଳାପ ଲଗ' },
        'Profile': { hi: 'प्रोफ़ाइल', or: 'ପ୍ରୋଫାଇଲ' },
        'Settings': { hi: 'सेटिंग्स', or: 'ସେଟିଂସ' },
        'Change Password': { hi: 'पासवर्ड बदलें', or: 'ପାସୱାର୍ଡ ବଦଳାନ୍ତୁ' },
        'Help & Support': { hi: 'सहायता और समर्थन', or: 'ସାହାଯ୍ୟ ଓ ସହାୟତା' },
        'Privacy Policy': { hi: 'गोपनीयता नीति', or: 'ଗୋପନୀୟତା ନୀତି' },
        'Terms & Conditions': { hi: 'नियम और शर्तें', or: 'ନିୟମ ଏବଂ ସର୍ତ୍ତାବଳୀ' },
        'Contact Support': { hi: 'सहायता से संपर्क करें', or: 'ସହାୟତା ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ' },
        'Need Help?': { hi: 'मदद चाहिए?', or: 'ସାହାଯ୍ୟ ଦରକାର?' },
        'Coordinator Helpdesk': { hi: 'समन्वयक हेल्पडेस्क', or: 'ସଂଯୋଜକ ହେଲ୍ପଡେସ୍କ' },
        'Logout': { hi: 'लॉग आउट', or: 'ଲଗଆଉଟ' },

        // --- Login ---
        'Welcome Back!': { hi: 'वापसी पर स्वागत है!', or: 'ପୁନର୍ବାର ସ୍ୱାଗତ!' },
        'Sign in to': { hi: 'साइन इन करें', or: 'ସାଇନ ଇନ କରନ୍ତୁ' },
        'Coordinator': { hi: 'समन्वयक', or: 'ସଂଯୋଜକ' },
        'Enter mobile number': { hi: 'मोबाइल नंबर दर्ज करें', or: 'ମୋବାଇଲ ନମ୍ବର ଦିଅନ୍ତୁ' },
        'Enter password': { hi: 'पासवर्ड दर्ज करें', or: 'ପାସୱାର୍ଡ ଦିଅନ୍ତୁ' },
        'Forgot Password?': { hi: 'पासवर्ड भूल गए?', or: 'ପାସୱାର୍ଡ ଭୁଲିଗଲେ?' },
        'Sign In': { hi: 'साइन इन', or: 'ସାଇନ ଇନ' },
        'Signing in…': { hi: 'साइन इन हो रहा है…', or: 'ସାଇନ ଇନ ହେଉଛି…' },
        "Don't have an account?": { hi: 'खाता नहीं है?', or: 'ଆକାଉଣ୍ଟ ନାହିଁ?' },
        'Sign Up': { hi: 'साइन अप', or: 'ସାଇନ ଅପ' },
        'Farmer': { hi: 'किसान', or: 'କୃଷକ' },
        'Suraksha': { hi: 'सुरक्षा', or: 'ସୁରକ୍ଷା' },

        // --- Header / greetings ---
        'Search anything...': { hi: 'कुछ भी खोजें...', or: 'କିଛି ବି ଖୋଜନ୍ତୁ...' },
        'Manage operations and ensure happy farmers': { hi: 'संचालन प्रबंधित करें और किसानों को खुश रखें', or: 'କାର୍ଯ୍ୟ ପରିଚାଳନା କରନ୍ତୁ ଏବଂ କୃଷକଙ୍କୁ ଖୁସି ରଖନ୍ତୁ' },
        'Manage operations and support Suraksha Didis': { hi: 'संचालन प्रबंधित करें और सुरक्षा दीदियों का समर्थन करें', or: 'କାର୍ଯ୍ୟ ପରିଚାଳନା କରନ୍ତୁ ଏବଂ ସୁରକ୍ଷା ଦିଦିଙ୍କୁ ସହାୟତା କରନ୍ତୁ' },

        // --- Dashboard ---
        'Overview': { hi: 'अवलोकन', or: 'ସମୀକ୍ଷା' },
        'Today': { hi: 'आज', or: 'ଆଜି' },
        'Yesterday': { hi: 'कल', or: 'ଗତକାଲି' },
        'This Week': { hi: 'इस सप्ताह', or: 'ଏହି ସପ୍ତାହ' },
        'This Month': { hi: 'इस महीने', or: 'ଏହି ମାସ' },
        'Active Policies': { hi: 'सक्रिय पॉलिसी', or: 'ସକ୍ରିୟ ପଲିସି' },
        'Claims History': { hi: 'दावा इतिहास', or: 'ଦାବି ଇତିହାସ' },
        'Enrollments': { hi: 'नामांकन', or: 'ପଞ୍ଜୀକରଣ' },
        'Total Premium': { hi: 'कुल प्रीमियम', or: 'ମୋଟ ପ୍ରିମିୟମ' },
        'Total Suraksha Didis': { hi: 'कुल सुरक्षा दीदी', or: 'ମୋଟ ସୁରକ୍ଷା ଦିଦି' },
        'Total Farmers': { hi: 'कुल किसान', or: 'ମୋଟ କୃଷକ' },
        'View All': { hi: 'सभी देखें', or: 'ସବୁ ଦେଖନ୍ତୁ' },
        'Claim Overview': { hi: 'दावा अवलोकन', or: 'ଦାବି ସମୀକ୍ଷା' },
        'View Details': { hi: 'विवरण देखें', or: 'ବିବରଣୀ ଦେଖନ୍ତୁ' },
        'Pending': { hi: 'लंबित', or: 'ବିଚାରାଧୀନ' },
        'Under Review': { hi: 'समीक्षाधीन', or: 'ସମୀକ୍ଷାଧୀନ' },
        'Approved': { hi: 'स्वीकृत', or: 'ଅନୁମୋଦିତ' },
        'Rejected': { hi: 'अस्वीकृत', or: 'ପ୍ରତ୍ୟାଖ୍ୟାନ' },
        'Needs Action': { hi: 'कार्रवाई आवश्यक', or: 'କାର୍ଯ୍ୟ ଆବଶ୍ୟକ' },
        'In Process': { hi: 'प्रक्रिया में', or: 'ପ୍ରକ୍ରିୟାରେ' },
        'Completed': { hi: 'पूर्ण', or: 'ସମ୍ପୂର୍ଣ୍ଣ' },
        'Not Approved': { hi: 'स्वीकृत नहीं', or: 'ଅନୁମୋଦିତ ନୁହେଁ' },

        // --- Common table / list labels ---
        'Status': { hi: 'स्थिति', or: 'ସ୍ଥିତି' },
        'Actions': { hi: 'कार्रवाई', or: 'କାର୍ଯ୍ୟ' },
        'Action': { hi: 'कार्रवाई', or: 'କାର୍ଯ୍ୟ' },
        'View': { hi: 'देखें', or: 'ଦେଖନ୍ତୁ' },
        'Filter': { hi: 'फ़िल्टर', or: 'ଫିଲ୍ଟର' },
        'Active': { hi: 'सक्रिय', or: 'ସକ୍ରିୟ' },
        'Inactive': { hi: 'निष्क्रिय', or: 'ନିଷ୍କ୍ରିୟ' },
        'Mobile Number': { hi: 'मोबाइल नंबर', or: 'ମୋବାଇଲ ନମ୍ବର' },
        'Region': { hi: 'क्षेत्र', or: 'ଅଞ୍ଚଳ' },
        'Location': { hi: 'स्थान', or: 'ସ୍ଥାନ' },
        'Joined On': { hi: 'शामिल हुए', or: 'ଯୋଗ ଦେଇଛନ୍ତି' },
        'Name': { hi: 'नाम', or: 'ନାମ' },
        'Loading…': { hi: 'लोड हो रहा है…', or: 'ଲୋଡ ହେଉଛି…' },
        'No claims found matching your filters.': { hi: 'आपके फ़िल्टर से मेल खाने वाला कोई दावा नहीं मिला।', or: 'ଆପଣଙ୍କ ଫିଲ୍ଟର ସହ ମେଳ ଖାଉଥିବା କୌଣସି ଦାବି ମିଳିଲା ନାହିଁ।' },

        // --- Claims page ---
        'Track, review and manage all goat insurance claims': { hi: 'सभी बकरी बीमा दावों को ट्रैक, समीक्षा और प्रबंधित करें', or: 'ସମସ୍ତ ଛେଳି ବୀମା ଦାବି ଟ୍ରାକ, ସମୀକ୍ଷା ଓ ପରିଚାଳନା କରନ୍ତୁ' },
        'Total Claims': { hi: 'कुल दावे', or: 'ମୋଟ ଦାବି' },
        'All Time': { hi: 'सभी समय', or: 'ସମସ୍ତ ସମୟ' },
        'All Claims': { hi: 'सभी दावे', or: 'ସମସ୍ତ ଦାବି' },
        'Farmer Name': { hi: 'किसान का नाम', or: 'କୃଷକଙ୍କ ନାମ' },

        // --- Farmers page ---
        'View and manage all farmers across all regions.': { hi: 'सभी क्षेत्रों के सभी किसानों को देखें और प्रबंधित करें।', or: 'ସମସ୍ତ ଅଞ୍ଚଳର ସମସ୍ତ କୃଷକଙ୍କୁ ଦେଖନ୍ତୁ ଓ ପରିଚାଳନା କରନ୍ତୁ।' },
        'Active Farmers': { hi: 'सक्रिय किसान', or: 'ସକ୍ରିୟ କୃଷକ' },
        'Inactive Farmers': { hi: 'निष्क्रिय किसान', or: 'ନିଷ୍କ୍ରିୟ କୃଷକ' },
        'Total Regions': { hi: 'कुल क्षेत्र', or: 'ମୋଟ ଅଞ୍ଚଳ' },
        'All Farmers': { hi: 'सभी किसान', or: 'ସମସ୍ତ କୃଷକ' },

        // --- Didis page ---
        'View and manage all Suraksha Didis across all regions': { hi: 'सभी क्षेत्रों की सभी सुरक्षा दीदियों को देखें और प्रबंधित करें', or: 'ସମସ୍ତ ଅଞ୍ଚଳର ସମସ୍ତ ସୁରକ୍ଷା ଦିଦିଙ୍କୁ ଦେଖନ୍ତୁ ଓ ପରିଚାଳନା କରନ୍ତୁ' },
        'Total Didis': { hi: 'कुल दीदी', or: 'ମୋଟ ଦିଦି' },
        'Active Didis': { hi: 'सक्रिय दीदी', or: 'ସକ୍ରିୟ ଦିଦି' },
        'Inactive Didis': { hi: 'निष्क्रिय दीदी', or: 'ନିଷ୍କ୍ରିୟ ଦିଦି' },
        'All Suraksha Didis': { hi: 'सभी सुरक्षा दीदी', or: 'ସମସ୍ତ ସୁରକ୍ଷା ଦିଦି' },

        // --- Goats page ---
        'View and manage all goats added by farmers': { hi: 'किसानों द्वारा जोड़ी गई सभी बकरियों को देखें और प्रबंधित करें', or: 'କୃଷକଙ୍କ ଦ୍ୱାରା ଯୋଡ଼ାଯାଇଥିବା ସମସ୍ତ ଛେଳିକୁ ଦେଖନ୍ତୁ ଓ ପରିଚାଳନା କରନ୍ତୁ' },
        'Total Goats': { hi: 'कुल बकरियाँ', or: 'ମୋଟ ଛେଳି' },
        'Active Goats': { hi: 'सक्रिय बकरियाँ', or: 'ସକ୍ରିୟ ଛେଳି' },
        'Inactive Goats': { hi: 'निष्क्रिय बकरियाँ', or: 'ନିଷ୍କ୍ରିୟ ଛେଳି' },
        'Ear Tag': { hi: 'कान टैग', or: 'କାନ ଟ୍ୟାଗ' },
        'Gender': { hi: 'लिंग', or: 'ଲିଙ୍ଗ' },
        'Male': { hi: 'नर', or: 'ଅଣ୍ଡିରା' },
        'Female': { hi: 'मादा', or: 'ମାଈ' },
        'Breed': { hi: 'नस्ल', or: 'ପ୍ରଜାତି' },

        // --- Goat / claim detail labels ---
        'Goat Details': { hi: 'बकरी विवरण', or: 'ଛେଳି ବିବରଣୀ' },
        'Goat Information': { hi: 'बकरी जानकारी', or: 'ଛେଳି ସୂଚନା' },
        'Policy & Insurance Details': { hi: 'पॉलिसी और बीमा विवरण', or: 'ପଲିସି ଓ ବୀମା ବିବରଣୀ' },
        'Valid Till': { hi: 'मान्य तक', or: 'ବୈଧ ଅବଧି' },
        'Policy No.': { hi: 'पॉलिसी नं.', or: 'ପଲିସି ନଂ' },
        'Age': { hi: 'आयु', or: 'ବୟସ' },
        'Weight': { hi: 'वजन', or: 'ଓଜନ' },
        'Date of Birth': { hi: 'जन्म तिथि', or: 'ଜନ୍ମ ତାରିଖ' },
        'Policy Start': { hi: 'पॉलिसी आरंभ', or: 'ପଲିସି ଆରମ୍ଭ' },
        'Policy End': { hi: 'पॉलिसी समाप्ति', or: 'ପଲିସି ସମାପ୍ତି' },
        'Premium Paid': { hi: 'भुगतान किया गया प्रीमियम', or: 'ଦିଆଯାଇଥିବା ପ୍ରିମିୟମ' },
        'Insured By': { hi: 'बीमाकर्ता', or: 'ବୀମାକାରୀ' },
        'Issued By': { hi: 'जारीकर्ता', or: 'ଜାରିକାରୀ' },
        'Vaccination Details': { hi: 'टीकाकरण विवरण', or: 'ଟିକାକରଣ ବିବରଣୀ' },
        'View Policy Details': { hi: 'पॉलिसी विवरण देखें', or: 'ପଲିସି ବିବରଣୀ ଦେଖନ୍ତୁ' },
        'Claim Details': { hi: 'दावा विवरण', or: 'ଦାବି ବିବରଣୀ' },
        'Track the progress of your claim': { hi: 'अपने दावे की प्रगति ट्रैक करें', or: 'ଆପଣଙ୍କ ଦାବିର ପ୍ରଗତି ଟ୍ରାକ କରନ୍ତୁ' },
        'Reported By': { hi: 'रिपोर्ट किया गया', or: 'ରିପୋର୍ଟ କରିଛନ୍ତି' },
        'Sum Insured': { hi: 'बीमित राशि', or: 'ବୀମା ରାଶି' },
        'Policy Number': { hi: 'पॉलिसी संख्या', or: 'ପଲିସି ସଂଖ୍ୟା' },
        'Death Information': { hi: 'मृत्यु जानकारी', or: 'ମୃତ୍ୟୁ ସୂଚନା' },
        'Cause of Death': { hi: 'मृत्यु का कारण', or: 'ମୃତ୍ୟୁର କାରଣ' },
        'Claim Amount': { hi: 'दावा राशि', or: 'ଦାବି ରାଶି' },

        // --- Farmer / Didi detail ---
        'Personal Information': { hi: 'व्यक्तिगत जानकारी', or: 'ବ୍ୟକ୍ତିଗତ ସୂଚନା' },
        'Full Name': { hi: 'पूरा नाम', or: 'ପୂର୍ଣ୍ଣ ନାମ' },
        'Role': { hi: 'भूमिका', or: 'ଭୂମିକା' },
        'Phone Number': { hi: 'फ़ोन नंबर', or: 'ଫୋନ ନମ୍ବର' },
        'Village': { hi: 'गाँव', or: 'ଗାଁ' },
        'Block': { hi: 'ब्लॉक', or: 'ବ୍ଲକ' },
        'District': { hi: 'ज़िला', or: 'ଜିଲ୍ଲା' },
        'State': { hi: 'राज्य', or: 'ରାଜ୍ୟ' },
        'Pin Code': { hi: 'पिन कोड', or: 'ପିନ କୋଡ' },
        'Address': { hi: 'पता', or: 'ଠିକଣା' },
        'Aadhaar Number': { hi: 'आधार संख्या', or: 'ଆଧାର ସଂଖ୍ୟା' },
        'Work Information': { hi: 'कार्य जानकारी', or: 'କାର୍ଯ୍ୟ ସୂଚନା' },
        'Working Region': { hi: 'कार्य क्षेत्र', or: 'କାର୍ଯ୍ୟ ଅଞ୍ଚଳ' },
        'Working Villages': { hi: 'कार्य गाँव', or: 'କାର୍ଯ୍ୟ ଗାଁ' },
        'Supervisor': { hi: 'पर्यवेक्षक', or: 'ପର୍ଯ୍ୟବେକ୍ଷକ' },
        'Reporting To': { hi: 'रिपोर्टिंग', or: 'ରିପୋର୍ଟିଂ' },
        'Assigned On': { hi: 'नियुक्त तिथि', or: 'ନ୍ୟସ୍ତ ତାରିଖ' },
        'Performance Overview': { hi: 'प्रदर्शन अवलोकन', or: 'କାର୍ଯ୍ୟଦକ୍ଷତା ସମୀକ୍ଷା' },
        'Policies Added': { hi: 'जोड़ी गई पॉलिसी', or: 'ଯୋଡ଼ାଯାଇଥିବା ପଲିସି' },
        'Claims Assisted': { hi: 'सहायता किए गए दावे', or: 'ସହାୟତା କରାଯାଇଥିବା ଦାବି' },
        'Verifications': { hi: 'सत्यापन', or: 'ଯାଞ୍ଚ' },
        'Vaccinations': { hi: 'टीकाकरण', or: 'ଟିକାକରଣ' },
        'Recent Activity': { hi: 'हाल की गतिविधि', or: 'ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ' },
        'No recent activity.': { hi: 'कोई हाल की गतिविधि नहीं।', or: 'କୌଣସି ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ ନାହିଁ।' },
        'Call Us': { hi: 'हमें कॉल करें', or: 'ଆମକୁ କଲ କରନ୍ତୁ' },
        'Chat Us': { hi: 'हमसे चैट करें', or: 'ଆମ ସହ ଚାଟ କରନ୍ତୁ' },
        'Edit Profile': { hi: 'प्रोफ़ाइल संपादित करें', or: 'ପ୍ରୋଫାଇଲ ସମ୍ପାଦନ କରନ୍ତୁ' },

        // --- Reports ---
        'Total Enrollments': { hi: 'कुल नामांकन', or: 'ମୋଟ ପଞ୍ଜୀକରଣ' },
        'Claims Filed': { hi: 'दायर दावे', or: 'ଦାଖଲ ଦାବି' },
        'Claims Paid': { hi: 'भुगतान किए गए दावे', or: 'ପ୍ରଦତ୍ତ ଦାବି' },
        'Total Premium Collection': { hi: 'कुल प्रीमियम संग्रह', or: 'ମୋଟ ପ୍ରିମିୟମ ସଂଗ୍ରହ' },

        // --- Settings / change password ---
        'Language': { hi: 'भाषा', or: 'ଭାଷା' },
        'Current Password': { hi: 'वर्तमान पासवर्ड', or: 'ବର୍ତ୍ତମାନ ପାସୱାର୍ଡ' },
        'New Password': { hi: 'नया पासवर्ड', or: 'ନୂଆ ପାସୱାର୍ଡ' },
        'Confirm New Password': { hi: 'नया पासवर्ड पुष्टि करें', or: 'ନୂଆ ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ' },
        'Enter current password': { hi: 'वर्तमान पासवर्ड दर्ज करें', or: 'ବର୍ତ୍ତମାନ ପାସୱାର୍ଡ ଦିଅନ୍ତୁ' },
        'Enter new password': { hi: 'नया पासवर्ड दर्ज करें', or: 'ନୂଆ ପାସୱାର୍ଡ ଦିଅନ୍ତୁ' },
        'Re-enter new password': { hi: 'नया पासवर्ड फिर से दर्ज करें', or: 'ନୂଆ ପାସୱାର୍ଡ ପୁଣି ଦିଅନ୍ତୁ' },
        'Update Password': { hi: 'पासवर्ड अपडेट करें', or: 'ପାସୱାର୍ଡ ଅପଡେଟ କରନ୍ତୁ' },
        'Keep your account secure': { hi: 'अपना खाता सुरक्षित रखें', or: 'ଆପଣଙ୍କ ଆକାଉଣ୍ଟ ସୁରକ୍ଷିତ ରଖନ୍ତୁ' },

        // --- Activity ---
        'New Enrollment': { hi: 'नया नामांकन', or: 'ନୂଆ ପଞ୍ଜୀକରଣ' },
        'Claim Activity': { hi: 'दावा गतिविधि', or: 'ଦାବି କାର୍ଯ୍ୟକଳାପ' },
        'Search activity...': { hi: 'गतिविधि खोजें...', or: 'କାର୍ଯ୍ୟକଳାପ ଖୋଜନ୍ତୁ...' }
    };

    function getLang() {
        try { var l = localStorage.getItem(LANG_KEY); return LANGS.indexOf(l) >= 0 ? l : 'en'; } catch (e) { return 'en'; }
    }
    function setLang(l) {
        if (LANGS.indexOf(l) < 0) l = 'en';
        try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
        apply(l);
    }

    var originals = new WeakMap(); // node -> original english string
    var applying = false;

    function translate(str, lang) {
        var key = (str || '').trim();
        if (!key) return null;
        var entry = DICT[key];
        if (entry && entry[lang]) {
            return str.replace(key, entry[lang]); // keep surrounding whitespace
        }
        return null;
    }

    function processTextNode(node, lang) {
        var orig = originals.get(node);
        if (orig === undefined) { orig = node.nodeValue; originals.set(node, orig); }
        var out = (lang === 'en') ? orig : (translate(orig, lang) || orig);
        if (node.nodeValue !== out) node.nodeValue = out;
    }

    var ATTRS = ['placeholder', 'title', 'aria-label'];

    function processElementAttrs(el, lang) {
        ATTRS.forEach(function (attr) {
            if (!el.hasAttribute(attr)) return;
            var bak = '__i18n_' + attr;
            var orig = el.getAttribute(bak);
            if (orig === null) { orig = el.getAttribute(attr); el.setAttribute(bak, orig); }
            var out = (lang === 'en') ? orig : (translate(orig, lang) || orig);
            if (el.getAttribute(attr) !== out) el.setAttribute(attr, out);
        });
    }

    function walk(root, lang) {
        if (root.nodeType === 3) { processTextNode(root, lang); return; }
        if (root.nodeType !== 1) return;

        var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (n) {
                var p = n.parentNode;
                if (!p) return NodeFilter.FILTER_REJECT;
                var tag = p.nodeName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
                if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        while (tw.nextNode()) nodes.push(tw.currentNode);
        nodes.forEach(function (n) { processTextNode(n, lang); });

        // element + descendants attributes
        if (root.matches) processElementAttrs(root, lang);
        var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[aria-label]') : [];
        Array.prototype.forEach.call(els, function (el) { processElementAttrs(el, lang); });
    }

    function updateSwitchers(lang) {
        document.querySelectorAll('[data-lang-label]').forEach(function (el) { el.textContent = LABELS[lang]; });
    }

    function apply(lang) {
        lang = lang || getLang();
        applying = true;
        try { if (document.body) walk(document.body, lang); } finally { applying = false; }
        document.documentElement.setAttribute('lang', HTML_LANG[lang] || 'en');
        updateSwitchers(lang);
    }

    var observer = new MutationObserver(function (muts) {
        if (applying) return;
        var lang = getLang();
        if (lang === 'en') return;
        applying = true;
        try {
            muts.forEach(function (m) {
                Array.prototype.forEach.call(m.addedNodes || [], function (n) { walk(n, lang); });
            });
        } finally { applying = false; }
    });

    function start() {
        var lang = getLang();
        if (lang !== 'en') apply(lang); else updateSwitchers(lang);
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    }

    global.I18N = {
        setLang: setLang,
        getLang: getLang,
        apply: function () { apply(getLang()); },
        LANGS: LANGS,
        LABELS: LABELS
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})(window);

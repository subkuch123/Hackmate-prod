import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            So you think you are at the right place? If yes, every collaboration has its own terms of use. Here's our terms and conditions.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last updated: December 2025 • Version 2.1.0
          </div>
        </motion.div>

        {/* Terms Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-8">
            {/* Terms of Use */}
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Terms of Use</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your use of Hackmate's products, software, services and websites (referred to collectively as the "Services" in this document) is subject to the terms of a legal agreement between you and Hackmate. Please read the following terms and conditions very carefully as your use of services is subject to your acceptance of and compliance with the following terms and conditions ("Terms").
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  By subscribing to or using any of our services, you agree that you have read, understood and are bound by the Terms, regardless of how you subscribe to or use the services. If you do not want to be bound by the Terms, you must not subscribe to or use our services.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  In these Terms, references to "you", "User", "Visitor" shall mean the end user accessing the Website, its contents and using the Services offered through the Website, and "we", "us" and "our" shall mean Hackmate.codes and its affiliates.
                </p>
              </div>

              {/* User Agreement */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">1</span>
                  </div>
                  <h3 className="text-xl font-bold">User Agreement</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  These Terms of Use govern your use of Services offered through https://hackmate.codes ("Site"). You agree to access "the site", subject to the terms and conditions of use as set out here. You may not use the Services if you do not accept the Terms.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Hackmate.codes may add to or change or update these Terms of Use, from time to time entirely at its own discretion. You are responsible for checking these Terms of Use periodically to remain in compliance with these terms. Your use of a Site after any amendment to the Terms of Use shall constitute your acceptance of these terms and you also agree to be bound by any such changes/revisions.
                </p>
              </div>

              {/* Accepting the Terms */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">2</span>
                  </div>
                  <h3 className="text-xl font-bold">Accepting the Terms</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  You can accept the Terms by:
                </p>
                <ul className="text-gray-300 leading-relaxed mt-2 ml-6 list-disc space-y-1">
                  <li>clicking to accept or agree to the Terms, where this option is made available to you by Hackmate in the user interface for any Service; or</li>
                  <li>by actually using the Services. In this case, you understand and agree that Hackmate will treat your use of the Services as acceptance of the Terms from that point onwards.</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  You may not use the Services and may not accept the Terms if you are not of legal age to form a binding contract with Hackmate. Before you continue, you should print off or save a local copy of the Terms for your records.
                </p>
              </div>

              {/* Modification */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">3</span>
                  </div>
                  <h3 className="text-xl font-bold">Modification</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Hackmate.codes reserves the right to suspend/cancel, or discontinue any or all channels, products or service at any time without notice, make modifications and alterations in any or all of the content, products and services contained on the site without prior notice. Any such modifications or alterations shall be notified at the website and all users must comply with the new terms and conditions.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  You understand and agree that if you use the Services after the date on which the Terms have changed, Hackmate will treat your use as acceptance of the updated Terms.
                </p>
              </div>

              {/* Registration, Access and Exchange of Information */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">4</span>
                  </div>
                  <h3 className="text-xl font-bold">Registration, Access and Exchange of Information</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  For certain services such as email, personal web pages, etc. registration by the visitor is required. To register for these services, you have to open an account by completing the registration process (i.e. by providing us with current, complete and accurate information as prompted by the applicable registration form). You will also choose a password and user name which will be your email id. You are entirely responsible for maintaining the confidentiality of your password and account. By registering, you agree to the following terms in addition to any other specific terms which shall be posted at an appropriate location of the Site.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  To access these services, you will be asked to enter your User Name and Password, as chosen by you during your registration. Therefore, we do not permit any of the following:
                </p>
                <ul className="text-gray-300 leading-relaxed mt-2 ml-6 list-disc space-y-1">
                  <li>Any other person sharing your account and Password;</li>
                  <li>Any part of the Site being cached in proxy servers and accessed by individuals who have not registered with Hackmate.codes as users of the Site; or</li>
                  <li>Access through a single account and Password being made available to multiple users on a network.</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  If Hackmate.codes reasonably believes that an account and password is being used/misused in any manner, Hackmate.codes shall reserve the right to cancel access rights immediately without notice, and block access to all users from that IP address.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Furthermore, you are entirely responsible for any and all activities that occur under your account. You agree to notify Hackmate.codes immediately of any unauthorized use of your account or any other breach of security. Hackmate.codes will not be liable for any loss that you may incur as a result of someone else using your password or account. However, you could be held liable for losses incurred by Hackmate.codes or another party due to someone else using your account or password.
                </p>
              </div>

              {/* Your passwords and account security */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">5</span>
                  </div>
                  <h3 className="text-xl font-bold">Your passwords and account security</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  You agree and understand that you are responsible for maintaining the confidentiality of passwords associated with any account you use to access the Services.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Accordingly, you agree that you will be solely responsible to Hackmate for all activities that occur under your account.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  If you become aware of any unauthorized use of your password or of your account, you agree to notify Hackmate immediately at <span className="text-cyan-400">team@hackmate.codes</span>
                </p>
              </div>

              {/* Privacy Policy */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">6</span>
                  </div>
                  <h3 className="text-xl font-bold">Privacy Policy</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  The User hereby consents, expresses and agrees that he/she has read and fully understands the Privacy Policy of Hackmate.codes in respect of the Website. The user further consents that the terms and contents of such Privacy Policy are acceptable to him.
                </p>
              </div>

              {/* Advertising Material */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">7</span>
                  </div>
                  <h3 className="text-xl font-bold">Advertising Material</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Part of the Site contains advertising information or promotion material or other material submitted to Hackmate by third parties. Responsibility for ensuring that material submitted for inclusion on Hackmate complies with applicable international and national law is exclusively on the party providing the information/material. Your correspondence or business dealings with, or participation in promotions of, advertisers other than Hackmate.codes found on or through the Website, including payment and delivery of related goods or services, and any other terms, conditions, warranties or representations associated with such dealings, are solely between you and such advertiser. We will not be responsible or liable for any claim, error, omission, inaccuracy in advertising material or any loss or damage of any sort incurred as the result of any such dealings or as the result of the presence of such advertisers on the Website. Hackmate reserves the right to omit, suspend or change the position of any advertising material submitted for insertion. Acceptance of advertisements on the Site will be subject to these terms and conditions.
                </p>
              </div>

              {/* User Conduct and Rules */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">8</span>
                  </div>
                  <h3 className="text-xl font-bold">User Conduct and Rules</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  You agree and undertake to use the Website and the Service only to post and upload messages and material that are proper. By way of example, and not as a limitation, you agree and undertake that when using a Service, you will not:
                </p>
                <ul className="text-gray-300 leading-relaxed mt-2 ml-6 list-disc space-y-1">
                  <li>Defame, abuse, harass, stalk, threaten or otherwise violate the legal rights of others;</li>
                  <li>Publish, post, upload, distribute or disseminate any inappropriate, profane, defamatory, infringing, obscene, indecent or unlawful topic, name, material or information;</li>
                  <li>Upload files that contain software or other material protected by intellectual property laws unless you own or control the rights thereto or have received all necessary consents;</li>
                  <li>Upload or distribute files that contain viruses, corrupted files, or any other similar software or programs that may damage the operation of the Website or another's computer;</li>
                  <li>Conduct or forward surveys, contests, pyramid schemes or chain letters;</li>
                  <li>Download any file posted by another user of a Service that you know, or reasonably should know, cannot be legally distributed in such manner;</li>
                  <li>Falsify or delete any author attributions, legal or other proper notices or proprietary designations or labels of the origin or source of software or other material contained in a file that is uploaded;</li>
                  <li>Violate any code of conduct or other guidelines, which may be applicable for or to any particular Service;</li>
                  <li>Violate any applicable laws or regulations for the time being in force in or outside India; and</li>
                  <li>Violate any of the terms and conditions of this Agreement or any other terms and conditions for the use of the Website contained elsewhere herein.</li>
                </ul>
              </div>

              {/* User Warranty and Representation */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">9</span>
                  </div>
                  <h3 className="text-xl font-bold">User Warranty and Representation</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  The user guarantees, warrants, and certifies that you are the owner of the content which you submit or otherwise authorized to use the content and that the content does not infringe upon the property rights, intellectual property rights or other rights of others. You further warrant that to your knowledge, no action, suit, proceeding, or investigation has been instituted or threatened relating to any content, including trademark, trade name service mark, and copyright formerly or currently used by you in connection with the Services rendered by Hackmate.codes.
                </p>
              </div>

              {/* Termination and Access Restriction */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">10</span>
                  </div>
                  <h3 className="text-xl font-bold">Termination and Access Restriction</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Hackmate.codes reserves the right, in its sole discretion, to terminate the access to the website and the related services or any portion thereof at any time, without notice.
                </p>
              </div>

              {/* Fee Payments */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">11</span>
                  </div>
                  <h3 className="text-xl font-bold">Fee Payments</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Hackmate.codes reserves the right to charge listing/advertising/product usage fees as well as transaction fees based on certain completed transactions using the Hackmate.codes Services. Hackmate.codes further reserves the right to alter any and all fees from time to time, without notice. The User shall be liable to pay all applicable charges, fees, duties, taxes, levies and assessments for availing the Hackmate.codes Services.
                </p>
              </div>

              {/* Delivery of Services */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">12</span>
                  </div>
                  <h3 className="text-xl font-bold">Delivery of Services</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  All our services are online. No physical delivery will be carried out for any of the services purchased. Users will get an email once a service is purchased with instructions on how to go about availing them on the website. Our team of experts will assist you in providing a hassle free user experience.
                </p>
              </div>

              {/* Cancellation/Refund Policy */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-red-400">13</span>
                  </div>
                  <h3 className="text-xl font-bold">Cancellation/Refund Policy</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  All sales/purchase of services are final with no refund or exchange permitted. However, if in a transaction performed by you on the site, money has been charged to your card or bank account without the delivery of the services, then you may inform us by sending an email to <span className="text-cyan-400">hackmate.17@gmail.com</span>, or <span className="text-cyan-400">team@hackmate.codes</span>. Hackmate.codes shall investigate the incident and if it is found that money was indeed charged to your card or bank account without delivery of the service, then you will be refunded the money within 21 working days from the date of receipt of your email. All refunds will be credited back to source of the payment after deducting the service charges and taxes(if applicable). It will take 3-21 days for the money to show in your bank account depending on your bank's policy.
                </p>
              </div>

              {/* Disclaimer of Warranties/Limitation of Liability */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">14</span>
                  </div>
                  <h3 className="text-xl font-bold">Disclaimer of Warranties/Limitation of Liability</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Hackmate.codes has endeavored to ensure that all the information on the Website is correct, but Hackmate.codes neither warrants nor makes any representations regarding the quality, accuracy or completeness of any data, information, product or Service. In no event shall Hackmate.codes be liable for any direct, indirect, punitive, incidental, special, consequential damages or any other damages resulting from:
                </p>
                <ul className="text-gray-300 leading-relaxed mt-2 ml-6 list-disc space-y-1">
                  <li>the use or the inability to use the Services;</li>
                  <li>unauthorized access to or alteration of the user's transmissions or data;</li>
                  <li>any other matter related to the services; including, without limitation, damages for loss of use, data or profits, arising out of or in any way connected with the use or performance of the website or service. Neither shall Hackmate.codes be responsible for the delay or inability to use the website or related services, the provision of or failure to provide services, or for any information, software, products, services and related graphics obtained through the website, or otherwise arising out of the use of the website, whether based on contract, tort, negligence, strict liability or otherwise. Further, Hackmate.codes shall not be held responsible for non-availability of the Website during periodic maintenance operations or any unplanned suspension of access to the website that may occur due to technical reasons or for any reason beyond Hackmate.codes's control. The user understands and agrees that any material and/or data downloaded or otherwise obtained through the website is done entirely at their own discretion and risk and they will be solely responsible for any damage to their computer systems or loss of data that results from the download of such material and/or data.</li>
                </ul>
              </div>

              {/* Indemnification */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">15</span>
                  </div>
                  <h3 className="text-xl font-bold">Indemnification</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  You agree to indemnify, defend and hold harmless Hackmate.codes from and against any and all losses, liabilities, claims, damages, costs and expenses (including legal fees and disbursements in connection therewith and interest chargeable thereon) asserted against or incurred by Hackmate.codes that arise out of, result from, or may be payable by virtue of, any breach or non-performance of any representation, warranty, covenant or agreement made or obligation to be performed by you pursuant to these Terms and for all the activities that occur through your account.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">16</span>
                  </div>
                  <h3 className="text-xl font-bold">Governing Law</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  These terms shall be governed by and constructed in accordance with the laws of India without reference to conflict of laws principles and disputes arising in relation hereto shall be subject to the exclusive jurisdiction of the courts at Delhi.
                </p>
              </div>

              {/* Severability */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">17</span>
                  </div>
                  <h3 className="text-xl font-bold">Severability</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  If any provision of the Terms is determined to be invalid or unenforceable in whole or in part, such invalidity or unenforceability shall attach only to such provision or part of such provision and the remaining part of such provision and all other provisions of these Terms shall continue to be in full force and effect.
                </p>
              </div>

              {/* Report Abuse */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-red-400">18</span>
                  </div>
                  <h3 className="text-xl font-bold">Report Abuse</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  As per these Terms, users are solely responsible for every material or content uploaded on to the website. Hackmate.codes does not verify, endorse or otherwise vouch for the contents of any user or any content generally posted or uploaded on to the website. Users can be held legally liable for their contents and may be held legally accountable if their contents or material include, for example, defamatory comments or material protected by copyright, trademark, etc. If you come across any abuse or violation of these Terms, please report to <span className="text-cyan-400">hackmate.17@gmail.com</span>
                </p>
              </div>

              {/* Forum Rules */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">19</span>
                  </div>
                  <h3 className="text-xl font-bold">Forum Rules</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Registration to the forum under Hackmate.codes is free. We do insist that you abide by the rules and policies detailed below. Although the administrators and moderators of Hackmate.codes will attempt to keep all objectionable messages off this forum, it is impossible for us to review all messages. All messages express the views of the author, Hackmate.codes will not be held responsible for the content of any message.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  By agreeing to these rules, you warrant that you will not post any messages that are obscene, vulgar, sexually-oriented, hateful, threatening, or otherwise violative of any laws.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Hackmate.codes reserves the right to remove, edit, move or close any thread for any reason.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  You agree that Hackmate may provide you with notices, including those regarding changes to the Terms, by email, regular mail, or postings on the Services.
                </p>
              </div>

              {/* Intellectual Property */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-400">20</span>
                  </div>
                  <h3 className="text-xl font-bold">Intellectual Property</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  You agree that the ownership, interest, rights and title over any and all intellectual property arising out of, created or developed by you by using the Services, shall solely vest with Hackmate's client and you shall have no claim whatsoever toward the same. Upon request by Hackmate or its client, you shall execute and deliver any documents that may be necessary or desirable under any law to preserve, or enable Hackmate or its client to enforce, its rights under or in connection with these Terms with respect to such intellectual property. You further agree not to make any claim or initiate any action against Hackmate or its client with respect to the ownership of such intellectual property.
                </p>
              </div>

              {/* Ending your relationship with Hackmate.codes */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-cyan-400">21</span>
                  </div>
                  <h3 className="text-xl font-bold">Ending your relationship with Hackmate.codes</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  The Terms will continue to apply until terminated by either you or Hackmate as set out below. If you want to terminate your legal agreement with Hackmate, you may do so by (a) notifying Hackmate at any time and (b) closing your accounts for all of the Services which you use, where Hackmate has made this option available to you. Your notice should be sent, in writing, to Hackmate's address which is set out at the beginning of these Terms.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Hackmate may at any time, terminate its legal agreement with you if:
                </p>
                <ul className="text-gray-300 leading-relaxed mt-2 ml-6 list-disc space-y-1">
                  <li>you have breached any provision of the Terms (or have acted in manner which clearly shows that you do not intend to, or are unable to comply with the provisions of the Terms); or</li>
                  <li>Hackmate is required to do so by law (for example, where the provision of the Services to you is, or becomes, unlawful); or</li>
                  <li>the partner with whom Hackmate offered the Services to you has terminated its relationship with Hackmate or ceased to offer the Services to you; or</li>
                  <li>the provision of the Services to you by Hackmate is, in Hackmate's opinion, no longer commercially viable.</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  When these Terms come to an end, all of the legal rights, obligations and liabilities that you and Hackmate have benefited from, been subject to (or which have accrued over time whilst the Terms have been in force) or which are expressed to continue indefinitely, shall be unaffected by this cessation, and the provisions of Indemnification and Governing Law shall continue to apply to such rights, obligations and liabilities indefinitely.
                </p>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="mt-8 pt-8 border-t border-gray-700/50">
            <div className="flex items-start space-x-4">
              <button
                onClick={() => setAgreed(!agreed)}
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                  agreed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gray-700 border border-gray-600'
                }`}
              >
                {agreed && <Check className="w-4 h-4 text-white" />}
              </button>
              <div>
                <label 
                  htmlFor="agreement" 
                  className="font-medium text-lg cursor-pointer block mb-2"
                >
                  I have read and agree to the Terms & Conditions
                </label>
                <p className="text-gray-400 text-sm">
                  By checking this box, you acknowledge that you have read, understood, and agree to all 
                  terms and conditions outlined above. You also agree to our Privacy Policy and Cookie Policy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 relative z-50"
        >
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-4 px-6 bg-purple-600 hover:bg-purple-700 rounded-xl text-center font-medium text-white transition-all"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => {
              if (agreed) {
                navigate('/dashboard');
              } else {
                alert('Please agree to the Terms & Conditions to continue.');
              }
            }}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg text-white ${
              agreed
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 cursor-pointer'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Continue to HackMate
          </button>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-8 border-t border-gray-700/50"
        >
          <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-xl p-6 border border-cyan-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <AlertCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Questions or Concerns?</h4>
                <p className="text-gray-400 mb-4">
                  If you have any questions about these terms, please contact our legal team for clarification.
                </p>
                <div className="flex flex-wrap gap-6">
                  <a 
                    href="mailto:hackmate.17@gmail.com"
                    className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>📧</span>
                    <span>hackmate.17@gmail.com</span>
                  </a>
                  <a 
                    href="mailto:team@hackmate.codes"
                    className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>📧</span>
                    <span>team@hackmate.codes</span>
                  </a>
                  <a 
                    href="mailto:reportabuse@hackmate.codes"
                    className="inline-flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    {/* <span>⚠️</span>
                    <span>Report Abuse</span> */}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
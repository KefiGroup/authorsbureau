/**
 * Generate copyright page content for books
 */
export function generateCopyrightPage(params: {
  bookTitle: string;
  authorName: string;
  copyrightYear?: number;
  publisherName?: string;
  publisherWebsite?: string;
  isbn?: string;
  disclaimerType?: "general" | "technology" | "none";
}): string {
  const {
    bookTitle,
    authorName,
    copyrightYear = new Date().getFullYear(),
    publisherName,
    publisherWebsite,
    isbn,
    disclaimerType = "general",
  } = params;

  const publisher = publisherName || "Self-Published";
  const website = publisherWebsite || "";

  let content = `${bookTitle}

Copyright © ${copyrightYear} by ${authorName}

All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

Published by ${publisher}`;

  if (website) {
    content += `\n${website}`;
  }

  if (isbn) {
    content += `\n\nISBN: ${isbn}`;
  }

  content += `\n\nFirst Edition: ${copyrightYear}`;

  // Add disclaimer based on type
  if (disclaimerType === "general") {
    content += `\n\nDISCLAIMER

The information provided in this book is for general informational purposes only. While the author has made every effort to ensure accuracy, the content should not be considered professional advice. Readers should consult with appropriate professionals for specific guidance related to their individual circumstances.

The author and publisher assume no responsibility for errors, omissions, or contrary interpretations of the subject matter. Any perceived slight of any individual or organization is purely unintentional.`;
  } else if (disclaimerType === "technology") {
    content += `\n\nDISCLAIMER

This book discusses artificial intelligence, technology, and related concepts that are rapidly evolving. The information provided reflects the state of knowledge at the time of publication and may become outdated as technology advances.

The author has made every effort to ensure accuracy, but this content should not be considered professional or technical advice. Readers should conduct their own research and consult with appropriate experts for specific guidance.

The author and publisher assume no responsibility for errors, omissions, or contrary interpretations of the subject matter. Any perceived slight of any individual or organization is purely unintentional.`;
  }

  content += `\n\nPrinted in the United States of America`;

  return content;
}

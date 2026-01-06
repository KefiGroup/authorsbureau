import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Copy, Check } from "lucide-react";

interface CopyrightPageGeneratorProps {
  bookTitle: string;
  authorName: string;
  onSave: (copyrightPage: string, data: CopyrightData) => void;
  initialData?: CopyrightData;
}

export interface CopyrightData {
  authorName: string;
  copyrightYear: number;
  publisherName: string;
  publisherAddress?: string;
  publisherWebsite?: string;
  isbn?: string;
  eisbn?: string;
  edition: string;
  country: string;
  includeDisclaimer: boolean;
  disclaimerType: 'nonfiction' | 'technology' | 'none';
}

export default function CopyrightPageGenerator({ 
  bookTitle, 
  authorName, 
  onSave,
  initialData 
}: CopyrightPageGeneratorProps) {
  const currentYear = new Date().getFullYear();
  
  const [data, setData] = useState<CopyrightData>(initialData || {
    authorName: authorName || '',
    copyrightYear: currentYear,
    publisherName: '',
    publisherAddress: '',
    publisherWebsite: '',
    isbn: '',
    eisbn: '',
    edition: 'First Edition',
    country: 'United States of America',
    includeDisclaimer: true,
    disclaimerType: 'nonfiction',
  });

  const [copied, setCopied] = useState(false);

  const generateCopyrightPage = (): string => {
    let page = `Copyright © ${data.copyrightYear} by ${data.authorName}\n\n`;
    
    page += `All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.\n\n`;

    if (data.publisherName) {
      page += `${data.publisherName}\n`;
      if (data.publisherAddress) page += `${data.publisherAddress}\n`;
      if (data.publisherWebsite) page += `${data.publisherWebsite}\n`;
      page += `\n`;
    }

    if (data.isbn) {
      page += `ISBN: ${data.isbn}\n`;
    }
    if (data.eisbn) {
      page += `eISBN: ${data.eisbn}\n`;
    }
    if (data.isbn || data.eisbn) page += `\n`;

    page += `${data.edition}: ${new Date(data.copyrightYear, 0).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\n`;

    page += `Printed in ${data.country}\n\n`;

    if (data.includeDisclaimer && data.disclaimerType !== 'none') {
      page += `DISCLAIMER\n\n`;
      
      if (data.disclaimerType === 'nonfiction') {
        page += `The information provided in this book is designed to provide helpful information on the subjects discussed. This book is not meant to be used, nor should it be used, to diagnose or treat any medical condition. For diagnosis or treatment of any medical problem, consult your own physician.\n\n`;
        page += `The publisher and author are not responsible for any specific health or allergy needs that may require medical supervision and are not liable for any damages or negative consequences from any treatment, action, application, or preparation, to any person reading or following the information in this book.\n\n`;
      } else if (data.disclaimerType === 'technology') {
        page += `This book discusses artificial intelligence, machine learning, and related technologies. The field of AI is rapidly evolving, and information presented here reflects the state of knowledge at the time of publication.\n\n`;
        page += `The author and publisher make no claims about the future development, capabilities, or limitations of AI systems. Examples and case studies are provided for illustrative purposes and may not reflect current or future implementations.\n\n`;
      }

      page += `The advice and strategies contained herein may not be suitable for every situation. This work is sold with the understanding that the publisher is not engaged in rendering legal, accounting, or other professional services. If professional assistance is required, the services of a competent professional person should be sought.\n\n`;
      
      page += `The author and publisher specifically disclaim any implied warranties of merchantability or fitness for a particular purpose. In no event will the author or publisher be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of the use of or inability to use the information provided in this book.\n`;
    }

    return page;
  };

  const copyrightPage = generateCopyrightPage();

  const handleCopy = () => {
    navigator.clipboard.writeText(copyrightPage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(copyrightPage, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Copyright & Legal Page Generator
        </CardTitle>
        <CardDescription>
          Generate a professional copyright page for "{bookTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input
              id="authorName"
              value={data.authorName}
              onChange={(e) => setData({ ...data, authorName: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyrightYear">Copyright Year</Label>
            <Input
              id="copyrightYear"
              type="number"
              value={data.copyrightYear}
              onChange={(e) => setData({ ...data, copyrightYear: parseInt(e.target.value) })}
              min="1900"
              max={currentYear + 1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisherName">Publisher Name</Label>
            <Input
              id="publisherName"
              value={data.publisherName}
              onChange={(e) => setData({ ...data, publisherName: e.target.value })}
              placeholder="Self-published or publisher name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisherWebsite">Publisher Website</Label>
            <Input
              id="publisherWebsite"
              value={data.publisherWebsite}
              onChange={(e) => setData({ ...data, publisherWebsite: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={data.isbn}
              onChange={(e) => setData({ ...data, isbn: e.target.value })}
              placeholder="978-0-00-000000-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eisbn">eISBN (Optional)</Label>
            <Input
              id="eisbn"
              value={data.eisbn}
              onChange={(e) => setData({ ...data, eisbn: e.target.value })}
              placeholder="978-0-00-000000-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edition">Edition</Label>
            <Input
              id="edition"
              value={data.edition}
              onChange={(e) => setData({ ...data, edition: e.target.value })}
              placeholder="First Edition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Printed In</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
              placeholder="United States of America"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="disclaimerType">Disclaimer Type</Label>
            <Select
              value={data.disclaimerType}
              onValueChange={(value) => setData({ ...data, disclaimerType: value as 'nonfiction' | 'technology' | 'none', includeDisclaimer: value !== 'none' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nonfiction">General Non-Fiction</SelectItem>
                <SelectItem value="technology">Technology/AI Book</SelectItem>
                <SelectItem value="none">No Disclaimer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Generated Copyright Page</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={copyrightPage}
            readOnly
            className="min-h-[400px] font-mono text-sm"
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save Copyright Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

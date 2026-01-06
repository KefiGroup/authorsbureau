import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, AlertCircle, BookOpen, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AmazonAccountChecklistProps {
  onComplete: () => void;
}

export function AmazonAccountChecklist({ onComplete }: AmazonAccountChecklistProps) {
  const [kdpAccountReady, setKdpAccountReady] = useState(false);
  const [authorCentralReady, setAuthorCentralReady] = useState(false);
  const [taxInfoComplete, setTaxInfoComplete] = useState(false);
  const [paymentMethodAdded, setPaymentMethodAdded] = useState(false);

  const allChecked = kdpAccountReady && authorCentralReady && taxInfoComplete && paymentMethodAdded;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Pre-Publishing Checklist
        </CardTitle>
        <CardDescription>
          Set up your Amazon accounts before publishing your book
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KDP Account Setup */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="kdp-account"
              checked={kdpAccountReady}
              onCheckedChange={(checked) => setKdpAccountReady(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="kdp-account"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Amazon KDP Account Set Up
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Create a free account to publish eBooks and paperbacks on Amazon
              </p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 mt-2"
                asChild
              >
                <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer">
                  Sign up for Amazon KDP <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Author Central Account Setup */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="author-central"
              checked={authorCentralReady}
              onCheckedChange={(checked) => setAuthorCentralReady(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="author-central"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Amazon Author Central Account Set Up
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your author profile, track sales, and connect with readers
              </p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 mt-2"
                asChild
              >
                <a href="https://authorcentral.amazon.com" target="_blank" rel="noopener noreferrer">
                  Sign up for Author Central <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="tax-info"
              checked={taxInfoComplete}
              onCheckedChange={(checked) => setTaxInfoComplete(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="tax-info"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Tax Information Completed
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Complete W-9 (US) or W-8 (non-US) tax interview in your KDP account
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="payment-method"
              checked={paymentMethodAdded}
              onCheckedChange={(checked) => setPaymentMethodAdded(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="payment-method"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Payment Method Added
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Add bank account or check payment method to receive royalties
              </p>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {allChecked ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Ready to Publish!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your Amazon accounts are set up. You can now download your publishing package and upload to KDP.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Complete Setup Required</AlertTitle>
            <AlertDescription>
              Check all items above to confirm your accounts are ready for publishing.
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Guide */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Quick Setup Guide
          </h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Sign up for Amazon KDP with your Amazon account</li>
            <li>Complete your author profile and tax information</li>
            <li>Add your payment method for royalty payments</li>
            <li>Sign up for Author Central to enhance your author page</li>
            <li>Download your publishing package and upload to KDP</li>
          </ol>
        </div>

        {/* Action Button */}
        <Button
          onClick={onComplete}
          disabled={!allChecked}
          className="w-full"
          size="lg"
        >
          {allChecked ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Continue to Download Package
            </>
          ) : (
            "Complete Checklist to Continue"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const reportSchema = z.object({
  issueType: z.string().min(1, 'Please select an issue type'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  photoUrl: z.string().optional()
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function QuickReport() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      issueType: '',
      location: '',
      description: '',
      photoUrl: ''
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, would upload to server and get URL back
      // For demo, just create a local object URL
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      form.setValue('photoUrl', preview);
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/reports', data);
      toast({
        title: 'Report submitted',
        description: 'Thank you for your contribution to urban monitoring.',
        variant: 'default',
      });
      form.reset();
      setPhotoPreview(null);
    } catch (error) {
      toast({
        title: 'Failed to submit report',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Report</h3>
        <p className="text-sm text-gray-500 mt-1">Submit an environmental issue</p>
      </div>
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="airPollution">Air Pollution</SelectItem>
                      <SelectItem value="trafficCongestion">Traffic Congestion</SelectItem>
                      <SelectItem value="flooding">Flooding</SelectItem>
                      <SelectItem value="noisePollution">Noise Pollution</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex rounded-md">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <i className="ri-map-pin-line"></i>
                    </span>
                    <Input 
                      {...field} 
                      className="rounded-l-none" 
                      placeholder="Enter address or tap on map" 
                    />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Describe the issue..."
                    rows={3}
                  />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block text-sm font-medium text-gray-700">Attach Photo (optional)</FormLabel>
              {photoPreview ? (
                <div className="mt-2 relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="h-40 w-full object-cover rounded-md" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      form.setValue('photoUrl', '');
                    }}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <i className="ri-image-add-line text-gray-400 text-3xl mx-auto"></i>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
      <div className="bg-gray-50 px-4 py-4">
        <Button 
          type="submit" 
          className="w-full" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>
      </div>
    </div>
  );
}

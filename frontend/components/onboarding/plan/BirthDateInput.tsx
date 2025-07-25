import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";

interface BirthDateInputProps {
  value?: Date;
  onChange: (birthDate: Date) => void;
}

export default function BirthDateInput({ value, onChange }: BirthDateInputProps) {
  const [month, setMonth] = useState(value?.getMonth() + 1 || 1);
  const [day, setDay] = useState(value?.getDate() || 1);
  const [year, setYear] = useState(value?.getFullYear() || 1990);
  const navigate = useNavigate();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 13 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleNext = () => {
    const birthDate = new Date(year, month - 1, day);
    const age = currentYear - year;
    
    if (age >= 13) {
      onChange(birthDate);
      navigate("/onboarding/weight");
    }
  };

  const age = currentYear - year;
  const isValid = age >= 13;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/height")}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-purple-600 font-medium">
            Create My Plan
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Select Your Birth Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((monthName, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day
                  </label>
                  <Select value={day.toString()} onValueChange={(value) => setDay(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((dayNum) => (
                        <SelectItem key={dayNum} value={dayNum.toString()}>
                          {dayNum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((yearNum) => (
                        <SelectItem key={yearNum} value={yearNum.toString()}>
                          {yearNum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {!isValid && (
              <p className="text-red-600 text-sm text-center">
                You must be at least 13 years old to use this app.
              </p>
            )}

            <Button
              onClick={handleNext}
              disabled={!isValid}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue
            </Button>
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-purple-600 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarRange } from "lucide-react";

export type TimeFrame = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

interface TimeFrameSelectorProps {
  selectedTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  className?: string;
}

const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  selectedTimeFrame,
  onTimeFrameChange,
  className
}) => {
  const timeFrames: TimeFrame[] = ['1M', '3M', '6M', '1Y', '5Y', 'ALL'];
  
  const getTimeFrameLabel = (timeFrame: TimeFrame): string => {
    switch (timeFrame) {
      case '1M': return '1 mois';
      case '3M': return '3 mois';
      case '6M': return '6 mois';
      case '1Y': return '1 an';
      case '5Y': return '5 ans';
      case 'ALL': return 'Tout';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <CalendarRange className="h-4 w-4 mr-2" />
          {getTimeFrameLabel(selectedTimeFrame)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {timeFrames.map((timeFrame) => (
          <DropdownMenuItem
            key={timeFrame}
            onClick={() => onTimeFrameChange(timeFrame)}
            className="flex items-center justify-between"
          >
            {getTimeFrameLabel(timeFrame)}
            {selectedTimeFrame === timeFrame && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TimeFrameSelector;

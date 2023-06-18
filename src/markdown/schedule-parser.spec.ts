import { ScheduleEvent, Range, OptionInfo } from "./event-models"
import { ScheduleParser } from "./schedule-parser"

describe("ScheduleParser", () => {
  it("should parse an entire schedule", () => {
    const input = `- 11:00 - 15:40 Title | -m -c red -p [string, foo@bar.com, vlad]
    description line 1  
    description line 2
  
- 16:00 Title 2 | -c green
    description line 1
  
- 18:00 - 20:00 Title 3
  
  `

    expect(new ScheduleParser(input).parse()).toEqual([
      new ScheduleEvent(
        new Range("11:00", "15:40"),
        "Title",
        [
          new OptionInfo("m", true),
          new OptionInfo("c", "red"),
          new OptionInfo("p", ["string", "foo@bar.com", "vlad"]),
        ],
        ["description line 1", "description line 2"],
        [],
      ),
      new ScheduleEvent(
        "16:00",
        "Title 2",
        [new OptionInfo("c", "green")],
        ["description line 1"],
        [],
      ),
      new ScheduleEvent(new Range("18:00", "20:00"), "Title 3", [], [], []),
    ])
  })
})

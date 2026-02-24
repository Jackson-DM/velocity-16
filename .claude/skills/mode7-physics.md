# SKILL: MODE 7 ENGINE DESIGN
Location: .claude/skills/mode7-physics.md

## GOAL
Simulate the SNES "Mode 7" floor-plane rendering and futuristic hover physics.

## INSTRUCTIONS
1. **Math First**: Use affine transformations to rotate and scale the ground plane relative to the camera.
2. **Hover Physics**: The vehicles shouldn't "drive"; they should "drift." Implement dampening, high-speed lateral friction, and a "float" bounce when landing jumps.
3. **Collision Strategy**: Use a bitmask or low-level tilemap check for track boundaries. 

## VERIFICATION
- Test rotation at 30, 60, and 90 degrees.
- Ensure 0.0 latency between input and Sprite-tilt.
